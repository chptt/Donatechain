// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/utils/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/access/Ownable.sol";

interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract DonationPlatform is ERC721, ReentrancyGuard, Ownable {
    AggregatorV3Interface internal priceFeed;
    
    enum CharityType { Housing, Meals, Medical, Education, Equipment, RiverCleaning }
    
    struct Campaign {
        uint256 tokenId;
        CharityType charityType;
        uint256 goalAmount; // in USD (with 18 decimals)
        uint256 totalDonations; // in ETH (with 18 decimals)
        address creator;
        string influencerName;
        string profileImageURL;
        bool active;
        uint256 createdAt;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;
    mapping(address => mapping(uint256 => uint256)) public userDonations; // user => tokenId => amount
    mapping(address => uint256[]) public userContributions; // user => tokenIds donated to
    
    uint256 private _tokenIdCounter;
    uint256 public constant DONATION_AMOUNT_USD = 10 * 10**18; // $10 in wei format
    
    event CampaignCreated(uint256 indexed tokenId, address indexed creator, CharityType charityType, uint256 goalAmount);
    event DonationMade(uint256 indexed tokenId, address indexed donor, uint256 amount);
    event Withdrawal(uint256 indexed tokenId, address indexed creator, uint256 amount);
    
    constructor() ERC721("DonationCampaign", "DONATE") Ownable(msg.sender) {
        // Sepolia ETH/USD Price Feed
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }
    
    function mintMyNFT(
        CharityType _charityType,
        uint256 _goalAmount,
        string memory _influencerName,
        string memory _profileImageURL
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Use _mint instead of _safeMint to allow multiple campaigns per wallet
        _mint(msg.sender, tokenId);
        
        campaigns[tokenId] = Campaign({
            tokenId: tokenId,
            charityType: _charityType,
            goalAmount: _goalAmount,
            totalDonations: 0,
            creator: msg.sender,
            influencerName: _influencerName,
            profileImageURL: _profileImageURL,
            active: true,
            createdAt: block.timestamp
        });
        
        creatorCampaigns[msg.sender].push(tokenId);
        
        emit CampaignCreated(tokenId, msg.sender, _charityType, _goalAmount);
        return tokenId;
    }
    
    function donate(uint256 _tokenId) public payable nonReentrant {
        require(campaigns[_tokenId].active, "Campaign not active");
        require(msg.value > 0, "Donation must be greater than 0");
        
        campaigns[_tokenId].totalDonations += msg.value;
        userDonations[msg.sender][_tokenId] += msg.value;
        
        // Add to user contributions if first donation to this campaign
        if (userDonations[msg.sender][_tokenId] == msg.value) {
            userContributions[msg.sender].push(_tokenId);
        }
        
        emit DonationMade(_tokenId, msg.sender, msg.value);
    }
    
    function withdraw(uint256 _tokenId) public nonReentrant {
        require(ownerOf(_tokenId) == msg.sender, "Not campaign owner");
        require(campaigns[_tokenId].totalDonations > 0, "No donations to withdraw");
        
        uint256 amount = campaigns[_tokenId].totalDonations;
        campaigns[_tokenId].totalDonations = 0;
        campaigns[_tokenId].active = false;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(_tokenId, msg.sender, amount);
    }
    
    function getCampaignsByCreator(address _creator) public view returns (uint256[] memory) {
        return creatorCampaigns[_creator];
    }
    
    function viewRequiredETH() public view returns (uint256) {
        int256 price = getLatestPrice();
        require(price > 0, "Invalid price");
        
        // Convert USD to ETH: (USD amount * 10^18) / (price * 10^8) * 10^18
        uint256 ethAmount = (DONATION_AMOUNT_USD * 10**8) / uint256(price);
        return ethAmount;
    }
    
    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price; // Price has 8 decimals
    }
    
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](_tokenIdCounter);
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
    
    function getUserContributions(address _user) public view returns (uint256[] memory) {
        return userContributions[_user];
    }
    
    function getUserDonationAmount(address _user, uint256 _tokenId) public view returns (uint256) {
        return userDonations[_user][_tokenId];
    }
    
    function getTotalCampaigns() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
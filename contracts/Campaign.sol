pragma solidity ^0.4.24;

/**
 * This contract manages the deployment of a Campaign contract for a specific user. This user
 * will invoke this contract with their account and this contract will deploy an instance of
 * the Campaign contract.
 * 
 */
contract CampaignFactory {
    // The addresses of all the deployed Campaign instances
    address[] public deployedCampaigns;
    
    // Create a new instance of the Campaign contract
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    // Return the list of all active campaigns
    function getDeloyedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

/**
 * A campaign contract for raising money to build a product. Contributors send ether to the contract
 * to fund the product. The manager of the contract is the product creator and has the ability to spend
 * campaign money through the request process. All spending requests must be approved by a minimum number
 * of campaign contributors.
 * 
 */
contract Campaign {
    // Struct for manager spending requests
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    // The address of the manager of the campaign (also deployer of contract) 
    address public manager;
    
    // The mimimum contribution allowed in Wei
    uint public minimumContribution;
    
    // Mapping of all the contributors to the campaign
    mapping(address => bool) public approvers;
    
    // Count of all the contributors to the campaign
    uint public approversCount;
    
    // Array of spending requests
    Request[] public requests;
    
    // Require that the sender is the manager for locking down contract methods
    modifier restricted() {
        require(msg.sender == manager, "Only the contract manager can call this method");
        _;
    }

    constructor(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
        approversCount = 0;
    }
    
    // Add a contributor to the appovers array if enough value is sent
    function contribute() public payable {
        require(msg.value >= minimumContribution, "Must send the at least the minimum value");
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    // Method for campaign manager to create a spending request
    function createRequest(string description, uint value, address recipient) public restricted {
        // Must initialize all 'value' types in struct, not 'reference' types 
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    // Method for campaign contributor to approve a spending request
    function approveRequest(uint index) public {
        // The sender of this message is a contributor
        require(approvers[msg.sender], "Must be a contributor to the campaign");
        
        Request storage request = requests[index];
        
        // The sender has not already voted on this request
        require(!request.approvals[msg.sender], "Cannot vote on the same request more than once");
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    // Method for the manager to send a request
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        // The request hasn't already been sent
        require(!request.complete, "This request has already been sent");
        
        // The number of approvers is greater than 50%
        require(request.approvalCount > (approversCount / 2), "Need a majority vote to finalize contract");
        
        // Transfer value to recipient
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    // Return a summary of a campaign
    function getSummary() public view returns(
        uint, uint, uint, uint, address
        ) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }

    // Get the request count
    function getRequestCount() public view returns(uint) {
        return requests.length;
    }
}
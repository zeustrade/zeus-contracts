// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

contract Governable {
    struct GovProposal {
        uint256 deadline;
        bool isActive;
    }

    address public gov;
    mapping(address => GovProposal) public govProposals;

    event GovernanceTransferRequested(address indexed newGov, uint256 deadline);
    event GovernanceTransferred(address indexed oldGov, address indexed newGov);

    constructor() public {
        gov = msg.sender;
    }

    modifier onlyGov() {
        require(msg.sender == gov, "Governable: forbidden");
        _;
    }

    function setGov(address _gov) external onlyGov {
        require(_gov != address(0), "Governable: invalid address");
        require(_gov != gov, "Governable: same governance");
        _requestForGov(_gov, type(uint256).max);
    }

    function setGovWithDeadline(address _gov, uint256 _deadline) external onlyGov {
        require(_gov != address(0), "Governable: invalid address");
        require(_gov != gov, "Governable: same governance");
        _requestForGov(_gov, _deadline);
    }

    function acceptGov() external {
        GovProposal storage proposal = govProposals[msg.sender];
        require(proposal.deadline > block.timestamp, "Governable: deadline expired");
        require(proposal.isActive == true, "Governable: proposal is not active");

        address oldGov = gov;
        delete govProposals[msg.sender];
        gov = msg.sender;

        emit GovernanceTransferred(oldGov, msg.sender);
    }

    function cancelGovProposal(address _gov) external onlyGov {
        require(govProposals[_gov].isActive, "Governable: proposal not active");
        delete govProposals[_gov];
    }

    function _requestForGov(address _gov, uint256 _deadline) internal {
        govProposals[_gov] = GovProposal(_deadline, true);

        GovernanceTransferRequested(_gov, _deadline);
    }
}

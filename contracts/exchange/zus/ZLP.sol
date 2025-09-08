// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../tokens/MintableBaseToken.sol";
import "../libraries/math/SafeMath.sol";
import "./interfaces/IZLP.sol";

contract ZLP is MintableBaseToken, IZLP {
    using SafeMath for uint256;

    uint256 public override cooldownDuration;

    uint256 public constant MAX_COOLDOWN_DURATION = 48 hours;

    event CooldownSet(uint256 cooldownDuration);
    event TokensFrozen(address indexed account, uint256 amount, uint256 releaseTime);
    event TokensUnfrozen(address indexed account, uint256 amount);

    mapping(address => CooldownInfo[]) public userCooldowns;
    mapping(address => uint256) public lastAddTime;

    constructor(uint256 _cooldownDuration) public MintableBaseToken("ZUES LP", "ZLP", 0) {
        cooldownDuration = _cooldownDuration;
    }

    function id() external pure returns (string memory _name) {
        return "ZLP";
    }

    function setCooldownDuration(uint256 _cooldownDuration) external override onlyGov {
        require(_cooldownDuration <= MAX_COOLDOWN_DURATION, "ZLP: cooldown too long");
        cooldownDuration = _cooldownDuration;
        emit CooldownSet(_cooldownDuration);
    }

    function getCooldownInfo(address _account) external view override returns (CooldownInfo[] memory) {
        return userCooldowns[_account];
    }

    function lastAddedAt(address _account) external view override returns (uint256) {
        return lastAddTime[_account];
    }

    function cleanupExpiredCooldowns(address _account) external override {
        _cleanupExpiredCooldowns(_account);
    }

    function getLockedAmount(address _account) public view override returns (uint256) {
        uint256 locked = 0;
        CooldownInfo[] storage cooldowns = userCooldowns[_account];

        for (uint256 i = 0; i < cooldowns.length; i++) {
            if (cooldowns[i].releaseTime > block.timestamp && cooldowns[i].amount > 0) {
                locked = locked.add(cooldowns[i].amount);
            }
        }

        return locked;
    }

    function getAvailableBalance(address _account) public view override returns (uint256) {
        uint256 totalBalance = balances[_account];
        uint256 lockedAmount = getLockedAmount(_account);
        return totalBalance >= lockedAmount ? totalBalance.sub(lockedAmount) : 0;
    }

    function mint(address _account, uint256 _amount) external override onlyMinter {
        _mint(_account, _amount);

        if (_amount > 0) {
            uint256 releaseTime = block.timestamp.add(cooldownDuration);
            userCooldowns[_account].push(CooldownInfo({amount: _amount, releaseTime: releaseTime}));

            lastAddTime[_account] = block.timestamp;
            emit TokensFrozen(_account, _amount, releaseTime);
        }
    }

    function burn(address _account, uint256 _amount) external override onlyMinter {
        require(getAvailableBalance(_account) >= _amount, "ZLP: insufficient available balance");

        _burn(_account, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) internal override {
        require(getAvailableBalance(_sender) >= _amount, "ZLP: transfer amount exceeds available balance");

        super._transfer(_sender, _recipient, _amount);

        _transferCooldownInfo(_sender, _recipient, _amount);
    }

    function _transferCooldownInfo(address _from, address _to, uint256 _amount) internal {
        if (_amount == 0) return;

        _cleanupExpiredCooldowns(_from);

        CooldownInfo[] storage fromCooldowns = userCooldowns[_from];
        uint256 remaining = _amount;

        for (uint256 i = 0; i < fromCooldowns.length && remaining > 0; i++) {
            if (fromCooldowns[i].amount > 0) {
                uint256 transferAmount = remaining > fromCooldowns[i].amount ? fromCooldowns[i].amount : remaining;

                if (transferAmount > 0) {
                    userCooldowns[_to].push(
                        CooldownInfo({amount: transferAmount, releaseTime: fromCooldowns[i].releaseTime})
                    );
                    fromCooldowns[i].amount = fromCooldowns[i].amount.sub(transferAmount);
                    remaining = remaining.sub(transferAmount);

                    emit TokensFrozen(_to, transferAmount, fromCooldowns[i].releaseTime);
                }
            }
        }

        if (getLockedAmount(_to) > 0) {
            lastAddTime[_to] = block.timestamp;
        }
    }

    function _cleanupExpiredCooldowns(address _account) internal {
        CooldownInfo[] storage cooldowns = userCooldowns[_account];
        uint256 totalUnfrozen = 0;

        uint256 i = 0;
        while (i < cooldowns.length) {
            CooldownInfo storage info = cooldowns[i];
            bool isExpired = info.releaseTime <= block.timestamp;

            if (isExpired && info.amount > 0) {
                totalUnfrozen = totalUnfrozen.add(info.amount);
            }

            if (isExpired || info.amount == 0) {
                uint256 lastIndex = cooldowns.length - 1;
                if (i != lastIndex) {
                    cooldowns[i] = cooldowns[lastIndex];
                }
                cooldowns.pop();
            } else {
                i++;
            }
        }

        if (totalUnfrozen > 0) {
            emit TokensUnfrozen(_account, totalUnfrozen);
        }
    }
}

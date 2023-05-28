// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/** Sample ERC-721 Token for testing */
contract TestToken is ERC721, Ownable {
  // solhint-disable-next-line no-empty-blocks
  constructor() ERC721("MyToken", "MTK") {}

  function mint(address to, uint256 tokenId) public {
    // Burn existing tokens to make tests easier
    if (_exists(tokenId)) {
      _burn(tokenId);
    }

    _safeMint(to, tokenId);
  }

  function burn(uint256 tokenId) public {
    _burn(tokenId);
  }
}

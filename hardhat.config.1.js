/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    networks: {
      polygonAmoy: {
        url: "https://rpc-amoy.polygon.technology/",
        accounts: ["1eafcc585bc4848eec2989d6dc66cdefd2c57cb5226621a068ed1053df089d42"]
      }
    }
  };
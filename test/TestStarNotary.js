const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it('1 can Create a Star', async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
  const response = await instance.tokenIdToStarInfo.call(tokenId);
  assert.equal(response, 'Awesome Star!');
});

it('2 lets user1 put up their star for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('3 lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it('4 lets user2 buy a star, if it is put up for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it('5 lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar('awesome star', starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  const tx = await instance.buyStar(starId, { from: user2, value: balance });
  const gasUsed = tx.receipt.gasUsed;
  const gasPrice = tx.receipt.effectiveGasPrice;
  const gasCosts = gasUsed * gasPrice;
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value = BigInt(balanceOfUser2BeforeTransaction) - (BigInt(balanceAfterUser2BuysStar) + BigInt(gasCosts));
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('6 can add the star name and star symbol properly', async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();
  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let name = await instance.name.call();
  let symbol = await instance.symbol.call();
  assert.equal(name, "star");
  assert.equal(symbol, "st");
});

it('7 lets 2 users exchange stars', async () => {
  // 1. create 2 Stars with different tokenId
  let tokenId1 = 71;
  let tokenId2 = 72;
  let owner1 = accounts[0];
  let owner2 = accounts[1];
  let instance = await StarNotary.deployed();
  await instance.createStar('Awesome Star 71!', tokenId1, { from: owner1 })
  await instance.createStar('Awesome Star 72!', tokenId2, { from: owner2 })
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(tokenId1, tokenId2, { from: owner1 });
  // 3. Verify that the owners changed
  let newOwnerToken1 = await instance.ownerOf.call(tokenId1);
  let newOwnerToken2 = await instance.ownerOf.call(tokenId2);
  assert.equal(newOwnerToken1, owner2);
  assert.equal(newOwnerToken2, owner1);
});

it('8 lets a user transfer a star', async () => {
  // 1. create a Star with different tokenId
  let tokenId = 8;
  let instance = await StarNotary.deployed();
  await instance.createStar('Another Star!', tokenId, { from: accounts[0] });
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(accounts[1], tokenId, { from: accounts[0] });
  // 3. Verify the star owner changed.
  const newOwner = await instance.ownerOf.call(tokenId);
  assert.equal(newOwner, accounts[1])
});

it('9 lookUptokenIdToStarInfo test', async () => {
  // 1. create a Star with different tokenId
  let tokenId = 9;
  let instance = await StarNotary.deployed();
  await instance.createStar('Dummy Star!', tokenId, { from: accounts[0] });
  // 2. Call your method lookUptokenIdToStarInfo
  const response = await instance.lookUptokenIdToStarInfo.call(tokenId);
  // 3. Verify if you Star name is the same
  assert.equal(response, 'Dummy Star!')
});
import { ethers } from "ethers";

const getExpectedContractAddress = async (
  deployer: ethers.Signer,
  actionsAfter: number
): Promise<string> => {
  const deployerAddress: string = await deployer.getAddress();
  const adminAddressTransactionCount : number = await deployer.getNonce();

  const expectedContractAddress:string = ethers.getCreateAddress({
    from: deployerAddress,
    nonce: adminAddressTransactionCount + actionsAfter,
  });
 
  return expectedContractAddress;
};

export { getExpectedContractAddress };

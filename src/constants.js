const CONTRACT_ADDRESS = '0x0dc738Da21eCAc8b06CD84675fB42616C064bC47';

const transformCharacterData = (characterData) => {
	return {
	  name: characterData.name,
	  imageURI: characterData.imageURI,
	  hp: characterData.hp.toNumber(),
	  maxHp: characterData.maxHp.toNumber(),
	  attackDamage: characterData.attackDamage.toNumber(),
	};
  };
  export { CONTRACT_ADDRESS, transformCharacterData };

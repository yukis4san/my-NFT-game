import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../../Components/LoadingIndicator';

// SelectCharacter コンポーネントを定義しています。
const SelectCharacter = ({ setCharacterNFT }) => {
	//NFT キャラクターのメタデータを保存する状態変数を初期化します。
	const [characters, setCharacters] = useState([]);

	// コントラクトのデータを保有する状態変数を初期化します。
	const [gameContract, setGameContract] = useState(null);

	// Minting の状態保存する状態変数を初期化します。
	const [mintingCharacter, setMintingCharacter] = useState(false);

	const mintCharacterNFTAction = (characterId) => async () => {
		try {
			if (gameContract) {
			// Mint が開始されたら、ローディングマークを表示する。
			setMintingCharacter(true);

			console.log('Minting character in progress...');
			const mintTxn = await gameContract.mintCharacterNFT(characterId);
			await mintTxn.wait();
			console.log('mintTxn:', mintTxn);
			// Mint が終了したら、ローディングマークを消す。
			setMintingCharacter(false);
			}
		} catch (error) {
			console.warn('MintCharacterAction Error:', error);
			// エラーが発生した場合も、ローディングマークを消す。
			setMintingCharacter(false);
		}
	};

	// ページがロードされた瞬間に下記を実行します。
	useEffect(() => {
	const { ethereum } = window;

	if (ethereum) {
	  const provider = new ethers.providers.Web3Provider(ethereum);
	  const signer = provider.getSigner();
	  const gameContract = new ethers.Contract(
		CONTRACT_ADDRESS,
		myEpicGame.abi,
		signer
	  );
	  // gameContract の状態を更新します。
	  setGameContract(gameContract);
	} else {
	  console.log('Ethereum object not found');
	}
  	}, []);

	// ページがロードされた瞬間に下記を実行します。
	useEffect(() => {
		// NFT キャラクターのデータをスマートコントラクトから取得します。
		const getCharacters = async () => {
		  try {
			console.log('Getting contract characters to mint');

			// ミント可能な全 NFT キャラクター をコントラクトをから呼び出します。
			const charactersTxn = await gameContract.getAllDefaultCharacters();

			console.log('charactersTxn:', charactersTxn);

			// すべてのNFTキャラクターのデータを変換します。
			const characters = charactersTxn.map((characterData) =>
			  transformCharacterData(characterData)
			);

			// ミント可能なすべてのNFTキャラクターの状態を設定します。
			setCharacters(characters);
		  } catch (error) {
			console.error('Something went wrong fetching characters:', error);
		  }
		};

		// イベントを受信したときに起動するコールバックメソッドを追加します。
		const onCharacterMint = async (sender, tokenId, characterIndex) => {
		  console.log(
			`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
		  );
		  // NFT キャラクターが Mint されたら、コントラクトからメタデータを受け取り、アリーナに移動するための状態に設定します。
		  if (gameContract) {
			const characterNFT = await gameContract.checkIfUserHasNFT();
			console.log('CharacterNFT: ', characterNFT);
			setCharacterNFT(transformCharacterData(characterNFT));
			alert(`NFT キャラクーが Mint されました -- リンクはこちらです: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}?tab=details`)
		  }
		};

		if (gameContract) {
		  getCharacters();
		  // リスナーの設定：NFT キャラクターが Mint された通知を受け取ります。
		  gameContract.on('CharacterNFTMinted', onCharacterMint);
		}
		return () => {
		  // コンポーネントがマウントされたら、リスナーを停止する。
		  if (gameContract) {
			gameContract.off('CharacterNFTMinted', onCharacterMint);
		  }
		};
	  }, [gameContract]);

	// NFT キャラクターをフロントエンドにレンダリングするメソッドです。
	const renderCharacters = () =>
	characters.map((character, index) => (
		<div className="character-item" key={character.name}>
		<div className="name-container">
			<p>{character.name}</p>
		</div>
		<img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} />		<button
			type="button"
			className="character-mint-button"
			onClick={mintCharacterNFTAction(index)}
		>{`Mint ${character.name}`}</button>
		</div>
	));


	return (
		<div className="select-character-container">
		  <h2>⏬ 一緒に戦う NFT キャラクターを選択 ⏬</h2>
		  {characters.length > 0 && (
			<div className="character-grid">{renderCharacters()}</div>
		  )}
		  {/* mintingCharacter = trueの場合のみ、ローディングマークを表示します。*/}
		  {mintingCharacter && (
			<div className="loading">
			  <div className="indicator">
				<LoadingIndicator />
				<p>Minting In Progress...</p>
			  </div>
			  <img
				src="https://i.imgur.com/JjXJ4Hf.gif"
				alt="Minting loading indicator"
			  />
			</div>
		  )}
		</div>
	  );

  };

  export default SelectCharacter;

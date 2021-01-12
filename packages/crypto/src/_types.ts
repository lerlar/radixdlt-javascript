import { Byte } from '@radixdlt/primitives'
import { UInt256 } from '@radixdlt/uint256'

import { ResultAsync } from 'neverthrow'

export type Hasher = (inputData: Buffer) => Buffer

export type Signer = Readonly<{
	/**
	 * Produces a cryptographic signature of the input.
	 *
	 * @param {UnsignedMessage} unsignedMessage - The unsigned message to be hashed and signed.
	 * @returns {Signature} An EC signature produces by this signer when signing the message.
	 */
	sign: (unsignedMessage: UnsignedMessage) => ResultAsync<Signature, Error>
}>

export type UnsignedMessage = Readonly<{
	unhashed: Buffer
	hasher: Hasher
}>

export type Signature = Readonly<{
	r: UInt256
	s: UInt256
}>

export type PublicKey = Readonly<{
	asData: (input: { readonly compressed: boolean }) => Buffer
	isValidSignature: (
		input: Readonly<{
			signature: Signature
			forData: UnsignedMessage
		}>,
	) => boolean
	equals: (other: PublicKey) => boolean
}>

export type PublicKeyProvider = Readonly<{
	derivePublicKey: () => ResultAsync<PublicKey, Error>
}>

export type PrivateKey = Signer & PublicKeyProvider

export type Address = Readonly<{
	publicKey: PublicKey
	magicByte: Byte
	toString: () => string
	equals: (other: Address) => boolean
}>

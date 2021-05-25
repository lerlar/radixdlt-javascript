import { err, ok, Result } from 'neverthrow'
import { PublicKeyT } from '@radixdlt/crypto'
import { Encoding } from '../bech32'
import {
	AbstractAddress,
	HRPFromNetwork,
	isAbstractAddress,
	NetworkFromHRP,
} from './abstractAddress'
import { AddressTypeT, ValidatorAddressT } from './_types'
import { NetworkT } from '@radixdlt/primitives'

export const isValidatorAddress = (
	something: unknown,
): something is ValidatorAddressT => {
	if (!isAbstractAddress(something)) return false
	return something.addressType === AddressTypeT.VALIDATOR
}

const hrpMainnet = 'vr'
const hrpBetanet = 'vb'
const maxLength = 300 // arbitrarily chosen
const encoding = Encoding.BECH32

const hrpFromNetwork: HRPFromNetwork = network => {
	switch (network) {
		case NetworkT.BETANET:
			return hrpBetanet
		case NetworkT.MAINNET:
			return hrpMainnet
	}
}

const networkFromHRP: NetworkFromHRP = hrp => {
	if (hrp === hrpMainnet) return ok(NetworkT.MAINNET)
	if (hrp === hrpBetanet) return ok(NetworkT.BETANET)
	const errMsg = `Failed to parse network from HRP ${hrp} for ValidatorAddress.`
	return err(new Error(errMsg))
}

const fromPublicKeyAndNetwork = (
	input: Readonly<{
		publicKey: PublicKeyT
		network: NetworkT
	}>,
): ValidatorAddressT =>
	AbstractAddress.byFormattingPublicKeyDataAndBech32ConvertingIt({
		...input,
		network: input.network,
		hrpFromNetwork,
		addressType: AddressTypeT.VALIDATOR,
		typeguard: isValidatorAddress,
		encoding,
		maxLength,
	})
		.orElse(e => {
			throw new Error(
				`Expected to always be able to create validator address from publicKey and network, but got error: ${e.message}`,
			)
		})
		._unsafeUnwrap({ withStackTrace: true })

const fromString = (bechString: string): Result<ValidatorAddressT, Error> =>
	AbstractAddress.fromString({
		bechString,
		addressType: AddressTypeT.VALIDATOR,
		typeguard: isValidatorAddress,
		networkFromHRP,
		encoding,
		maxLength,
	})

export type ValidatorAddressUnsafeInput = string

const isValidatorAddressUnsafeInput = (
	something: unknown,
): something is ValidatorAddressUnsafeInput => typeof something === 'string'

export type ValidatorAddressOrUnsafeInput =
	| ValidatorAddressUnsafeInput
	| ValidatorAddressT

export const isValidatorAddressOrUnsafeInput = (
	something: unknown,
): something is ValidatorAddressOrUnsafeInput =>
	isValidatorAddress(something) || isValidatorAddressUnsafeInput(something)

const fromUnsafe = (
	input: ValidatorAddressOrUnsafeInput,
): Result<ValidatorAddressT, Error> =>
	isValidatorAddress(input) ? ok(input) : fromString(input)

export const ValidatorAddress = {
	fromUnsafe,
	fromPublicKeyAndNetwork,
}

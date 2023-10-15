// The implementation of decoding of the unit vector is from 
// https://github.com/CesiumGS/cesium/blob/4ce2d16c0cc6d97ee05abc0b7ce959d812e3fff7/packages/engine/Source/Core/AttributeCompression.js#L119
import { Vector3 } from 'three';
import { clamp } from 'three/src/math/MathUtils';

/**
 * Converts a SNORM value in the range [0, rangeMaximum] to a scalar in the range [-1.0, 1.0].
 * @param {number} value SNORM value in the range [0, rangeMaximum]
 * @param {number} [rangeMaximum=255] The maximum value in the SNORM range, 255 by default.
 * @returns {number} Scalar in the range [-1.0, 1.0].
 */
export function fromSNorm( value, rangeMaximum ) {

	const defaultRange = rangeMaximum || 255;
	return (
		( clamp( value, 0.0, defaultRange ) / defaultRange ) * 2.0 - 1.0
	);

}

/**
 * Returns 1.0 if the given value is positive or zero, and -1.0 if it is negative.
 * This is similar to Math.sign except that returns 1.0 instead of
 * 0.0 when the input value is 0.0.
 * @param {number} value The value to return the sign of.
 * @returns {number} The sign of value.
 */
export function signNotZero( value ) {

	return value < 0.0 ? - 1.0 : 1.0;

}

/**
 * Decodes a unit-length vector in 'oct' encoding to a normalized 3-component vector.
 *
 * @param {number} x The x component of the oct-encoded unit length vector.
 * @param {number} y The y component of the oct-encoded unit length vector.
 * @param {number} rangeMax The maximum value of the SNORM range. The encoded vector is stored in log2(rangeMax+1) bits.
 * @returns {array} The decoded and normalized vector.
 */
export function octDecodeInRange( x, y, rangeMax ) {

	const result = new Vector3();
	if ( x < 0 || x > rangeMax || y < 0 || y > rangeMax ) {

		console.error( `x and y must be unsigned normalized integers between 0 and ${rangeMax}` );

	}

	result.x = fromSNorm( x, rangeMax );
	result.y = fromSNorm( y, rangeMax );
	result.z = 1.0 - ( Math.abs( result.x ) + Math.abs( result.y ) );

	if ( result.z < 0.0 ) {

		const oldVX = result.x;
		result.x = ( 1.0 - Math.abs( result.y ) ) * signNotZero( oldVX );
		result.y = ( 1.0 - Math.abs( oldVX ) ) * signNotZero( result.y );

	}

	result.normalize();

	return [
		result.x,
		result.y,
		result.z
	];

}

module.exports = {
	presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./'],
				alias: {
					'@': './src',
				},
				extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
			},
		],
		[
			'module:react-native-dotenv',
			{
				moduleName: '@env',
				path: '.env',
				safe: false,
				allowUndefined: false,
			},
		],
		// Reanimated 4 moveu o plugin para react-native-worklets.
		// Deve ser sempre o último plugin da lista.
		'react-native-worklets/plugin',
	],
};

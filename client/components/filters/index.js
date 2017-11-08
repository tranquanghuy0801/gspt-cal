import roundUp from './roundUp';
import segmentConvert from './segmentConvert';
import startFrom from './startFrom';

export default angular.module('calApp.filters', [])
	.filter('roundUp', roundUp)
	.filter('segmentConvert', segmentConvert)
	.filter('startFrom', startFrom)
	.name;
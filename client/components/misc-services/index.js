import JSONToCSVConvertor from './json-to-csv';
import copyTextToClipboard from './copy-text-to-clipboard';
import ColorFinder from './color-finder';
import HourFinder from './hour-finder';
import StartFinder from './start-finder';
import ValidIndexes from './valid-indexes';
import DateFinder from './date-finder';

 export default angular.module('calApp.MiscServices', [])
  .factory('ColorFinder', ColorFinder)
  .factory('HourFinder', HourFinder)
  .factory('StartFinder', StartFinder)
  .factory('JSONToCSVConvertor', JSONToCSVConvertor)
  .factory('copyTextToClipboard', copyTextToClipboard)
  .factory('ValidIndexes', ValidIndexes)
  .factory('DateFinder', DateFinder)
  .name;
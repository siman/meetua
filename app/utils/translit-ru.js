'use strict';

/**
 * Created by Alex Siman on 9/14/14.
 */

var dictionary = {
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'e',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'i',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'kh',
  'ц': 'ts',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'shch',
  'ъ': '',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'iu',
  'я': 'ia'
};

exports.translitForEmail = function(string) {
  if (!string) return string;
  else return string.toLowerCase().replace(
    /([а-яё])/gi, function(matchResult) {
      return dictionary[matchResult] || "";
    }
  );
};
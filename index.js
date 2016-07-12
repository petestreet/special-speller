"use strict";

var tolerance = 2.5;

var PhysicalKey = function(ch, x, y) {
    this.ch = ch, this.x = x, this.y = y;

    this.get_distance = function (physical_key, distance_type) {
        if (physical_key.ch == ' ') {
            return 1;
        }
        else {
            if (typeof distance_type === 'undefined') {
                // the default behavior returns Manhattan distance.
                return Math.abs(this.x - physical_key.x) + Math.abs(this.y - physical_key.y);
            }
            else {
                // feel free to add other types of distance calculations here.  For example, Euclidean distance:
                return Math.sqrt(Math.pow((this.x - physical_key.x), 2) + Math.pow((this.y - physical_key.y), 2))
            }
        }
    };
};

var PHYSICAL_KEYS = {};
'1 2 3 4 5 6 7 8 9 0 - ='.split(' ').forEach(addToPhysicalKeyboard, {'x': 0, 'y': 0});
'q w e r t y u i o p [ ]'.split(' ').forEach(addToPhysicalKeyboard, {'x': 0.5, 'y': 1});
'a s d f g h j k l'.split(' ').forEach(addToPhysicalKeyboard, {'x': 0.7, 'y': 2});
'z x c v b n m , . /'.split(' ').forEach(addToPhysicalKeyboard, {'x': 1.2, 'y': 3});
PHYSICAL_KEYS[' '] = new PhysicalKey(' ', 0, 0);  // default value for a 'space' key

function addToPhysicalKeyboard(value, index, ar) {
    PHYSICAL_KEYS[value] = new PhysicalKey(value, index + this['x'], this['y']);
}

var word_bank = [];

exports.specialSpeller = function(word_to_correct, word_bank) {
    word_bank = word_bank.map(toLower);
    word_to_correct = toLower(word_to_correct);

    if (word_to_correct.length > 0) {
        return match_closest_word(word_to_correct, word_bank);
    }
    else return word_to_correct;
};

function toLower(word) {
    return (typeof word === 'string') ? word.toLowerCase() : word;
}

function match_closest_word(test_word, word_bank) {
    var min_distance = Number.MAX_VALUE;
    var new_word = null;
    word_bank.some(function(word) {
        var distance = physical_edit_distance(word, test_word);
        if (distance == 0) {
            // perfect match!
            new_word = word;
            return true;
        }
        else if (distance < tolerance && distance < min_distance) {
            // matched within our pre-defined tolerance - don't break, since there might be a better match later on in the array
            min_distance = distance;
            new_word = word;
        }
    });
    return (new_word == null) ? test_word : new_word;  // if there was no match, return the original word
}

function physical_edit_distance(word_1, word_2) {
    var length_difference = word_1.length - word_2.length;
    if (length_difference != 0) {  // normalize string lengths by inserting spaces into the shorter word
        if (length_difference < 0) {
            word_1 = [word_2, word_2 = word_1][0];  // one-line swap :)
        }
        for (var i = 0; i < word_1.length; i++) {
            if (word_1[i] != word_2[i]) {
                word_2 = [word_2.slice(0, i), ' ', word_2.slice(i)].join('');  // thanks, SO!
            }
        }
        word_2 = word_2.slice(0, word_1.length);
    }

    // check pairs of letters, rather than individual letters
    var running_distance = 0;
    for (var i = 0; i < word_1.length - 1; i++) {
        // account for invalid characters
        var word_1_curr_key = PHYSICAL_KEYS.hasOwnProperty(word_1[i]) ? word_1[i] : ' ';
        var word_1_next_key = PHYSICAL_KEYS.hasOwnProperty(word_1[i+1]) ? word_1[i+1] : ' ';
        var word_2_curr_key = PHYSICAL_KEYS.hasOwnProperty(word_2[i]) ? word_2[i] : ' ';
        var word_2_next_key = PHYSICAL_KEYS.hasOwnProperty(word_2[i+1]) ? word_2[i+1] : ' ';

        if (word_1_curr_key == word_2_next_key &&
            word_1_next_key == word_2_curr_key &&
            word_1_curr_key != ' ' &&
            word_1_next_key != ' ' &&
            word_1_curr_key != word_1_next_key) {
            //swapped letters
            running_distance += 1;
            if (i == 0 || i == word_1.length - 2) {  // ends of the word
                running_distance -= (PHYSICAL_KEYS[word_1_curr_key].get_distance(PHYSICAL_KEYS[word_2_curr_key])) / 2.0;
            }
            else {
                running_distance -= PHYSICAL_KEYS[word_1_curr_key].get_distance(PHYSICAL_KEYS[word_2_curr_key]);
            }
        }
        else if (i == 0) {
            // beginning of the word
            running_distance += PHYSICAL_KEYS[word_1_curr_key].get_distance(PHYSICAL_KEYS[word_2_curr_key]) +
                ((PHYSICAL_KEYS[word_1_next_key].get_distance(PHYSICAL_KEYS[word_2_next_key])) / 2.0);
        }
        else if (i == word_1.length - 2) {
            // end of the word
            running_distance += ((PHYSICAL_KEYS[word_1_curr_key].get_distance(PHYSICAL_KEYS[word_2_curr_key]) / 2.0) +
            PHYSICAL_KEYS[word_1_next_key].get_distance(PHYSICAL_KEYS[word_2_next_key]));
        }
        else {
            // somewhere in the middle of the word
            running_distance += (PHYSICAL_KEYS[word_1_curr_key].get_distance(PHYSICAL_KEYS[word_2_curr_key]) / 2.0) +
                (PHYSICAL_KEYS[word_1_next_key].get_distance(PHYSICAL_KEYS[word_2_next_key]) / 2.0);
        }
    }
    return running_distance;
}
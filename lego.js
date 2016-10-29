'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITY = [undefined, 'select', 'limit', 'format'];

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var copy = collection.map(function (element) {
        return Object.assign({}, element);
    });

    return [].slice.call(arguments, 1)
        .sort(function (a, b) {
            return PRIORITY.indexOf(a.name) - PRIORITY.indexOf(b.name);
        })
        .reduce(function (acc, func) {
            return func(acc, collection);
        }, copy);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        var existingFields = fields.filter(function (field) {
            return collection[0][field] !== undefined;
        });

        return collection.map(function (element) {
            return existingFields.reduce(function (acc, value) {
                acc[value] = element[value];

                return acc;
            }, {});
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function (collection) {
        return collection.filter(function (element) {
            return values.indexOf(element[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    var orderCoefficient = order === 'asc' ? 1 : -1;

    return function (collection) {
        return collection.sort(function (a, b) {
            var comparisonResult = a[property] > b[property] ? 1 : -1;

            return comparisonResult * orderCoefficient;
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (element) {
            var elementCopy = Object.assign({}, element);
            elementCopy[property] = formatter(element[property]);

            return elementCopy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        var filterFunctions = [].slice.call(arguments);

        return function (collection) {
            return collection.filter(function (element) {
                return filterFunctions.some(function (filter) {
                    return filter(collection).indexOf(element) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var filterFunctions = [].slice.call(arguments);

        return function (collection) {
            return collection.filter(function (element) {
                return filterFunctions.every(function (filter) {
                    return filter(collection).indexOf(element) !== -1;
                });
            });
        };
    };
}

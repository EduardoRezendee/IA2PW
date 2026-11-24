const { DataTypes } = require('sequelize');
const db = require('../db/conn.js');

const Venda = db.define('Venda', {
    valorTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    itens: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('itens');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch {
                return [];
            }
        },
        set(value) {
            this.setDataValue('itens', typeof value === 'string' ? value : JSON.stringify(value));
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'FINALIZADA'
    }
});

module.exports = Venda;


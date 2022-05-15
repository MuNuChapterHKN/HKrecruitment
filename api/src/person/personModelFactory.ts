const { DataTypes, Model } = require('sequelize');

export type PersonModelAttributes = {
    id: string,
    name: string,
    surname: string,
    sex: string,
    email: string,
    phone_no: string
    image: string
}

export class PersonModel extends Model<PersonModelAttributes, PersonModelAttributes> {
    declare id: string;
    declare name: string;
    declare surname: string;
    declare sex: string;
    declare email: string;
    declare image: string;
    declare phone_no: string

}

export function personModelFactory(sequelize) {
    PersonModel.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sex: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_no: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Person',
        tableName: 'Person',
        schema: 'public',
        timestamps: false
    });
    return PersonModel
}

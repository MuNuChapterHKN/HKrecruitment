import {Applicant} from "../datatypes/entities";

const {DataTypes, Model} = require('sequelize');

type ApplicantModelAttributes = {
    id: string,
    birth_date: string,
    telegram_uid?: string,
    how_know_HKN: string
}

export class ApplicantModel extends Model<ApplicantModelAttributes, ApplicantModelAttributes> {
    declare id: string;
    declare birth_date: string;
    declare telegram_uid?: string;
    declare how_know_HKN: string
}

export function applicantModel(sequelize, PersonModel) {
    ApplicantModel.init({
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        birth_date: {
            type: DataTypes.STRING
        },
        telegram_uid: {
            type: DataTypes.STRING
        },
        how_know_HKN: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'Applicant',
        tableName: 'Applicant',
        schema: 'public',
        timestamps: false
    });
    ApplicantModel.hasOne(PersonModel, {foreignKey: 'id'})
    PersonModel.belongsTo(ApplicantModel, {foreignKey: 'id'})
    return ApplicantModel
}

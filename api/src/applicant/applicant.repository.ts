import {Applicant} from "../datatypes/entities";
import {ApplicantRepositoryInterface} from "./applicant";
import {inject, injectable} from "inversify";
import {ApplicantModel, applicantModelFactory} from "./applicant.model";
import {personModelFactory, PersonModel} from "../person/personModelFactory";
import {Sequelize} from "sequelize";
import {TYPES} from "../ioc/types";
import {provideSingleton} from "../util";

@provideSingleton(ApplicantRepository)
export class ApplicantRepository implements ApplicantRepositoryInterface {
    private _applicantModel: { new(): ApplicantModel }
    private _personModel: { new(): PersonModel }

    constructor(@inject(TYPES.Sequelize) private _sequelize: Sequelize) {
        this._personModel = personModelFactory(this._sequelize)
        this._applicantModel = applicantModelFactory(this._sequelize, this._personModel)
    }

    public async getAll() {
        // @ts-ignore
        const sqlApplicants = await this._applicantModel.findAll({
            include: [{
                model: this._personModel,
                required: true
            }]
        }).catch((err) => {
                throw err
            }
        );
        const applicants: Applicant[] = sqlApplicants.map(applicant => {
            const outApplicant: Applicant = {
                id: applicant.id,
                birth_date: applicant.birth_date,
                telegram_uid: applicant.telegram_uid,
                how_know_HKN: applicant.how_know_HKN,
                name: applicant.Person.name,
                surname: applicant.Person.surname,
                email: applicant.Person.email,
                phone_no: applicant.Person.phone_no,
                image: applicant.Person.image,
                sex: applicant.Person.sex,
            }
            return outApplicant
        })
        return applicants
    }

    public async add(applicant: Applicant) {
        // @ts-ignore
        const person = await this._personModel.create({
            id: applicant.id,
            name: applicant.name,
            surname: applicant.surname,
            email: applicant.email,
            phone_no: applicant.phone_no,
            image: applicant.image,
            sex: applicant.sex,
        }).catch((err) => {
            console.error(err)
            throw err
        })

        return await person.createApplicant({
            id: applicant.id,
            birth_date: applicant.birth_date,
            telegram_uid: applicant.telegram_uid,
            how_know_HKN: applicant.how_know_HKN
        }).catch((err) => {
            console.error(err)
            throw err
        })
    }
}

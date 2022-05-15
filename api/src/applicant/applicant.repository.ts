import {Applicant} from "../datatypes/entities";

export function applicantRepository(applicantModel, personModel): {
    add: (applicant: Applicant) => Promise<Applicant>,
    getAll: () => Promise<Applicant[]>
} {
    const getAll = async () => {
        const sqlApplicants = await applicantModel.findAll({
            include: [{
                model: personModel,
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
    const add = async (applicant: Applicant) => {
        const person = await personModel.create({
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

        const insertedApplicant = await person.createApplicant({
            id: applicant.id,
            birth_date: applicant.birth_date,
            telegram_uid: applicant.telegram_uid,
            how_know_HKN: applicant.how_know_HKN
        }).catch((err) => {
            console.error(err)
            throw err
        })

        return insertedApplicant
    }
    return {
        getAll: getAll,
        add: add,
    }
}

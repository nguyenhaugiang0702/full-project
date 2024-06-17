const { ObjectId } = require("mongodb");
class SubjectService {
    constructor(client) {
        this.Subject = client.db('random_questions').collection("subjects");
    }
    extractSubjectData(payload) {
        const subject = {
            subject_name: payload.subject_name,
            subject_code: payload.subject_code,
            admin_id: ObjectId.isValid(payload.admin_id)
                ? new ObjectId(payload.admin_id)
                : null,
        };
        // Remove undefined fields
        Object.keys(subject).forEach(
            (key) => subject[key] === undefined && delete subject[key]
        );
        return subject;
    }

    // create
    async create(payload) {
        const subject = this.extractSubjectData(payload);
        const result = await this.Subject.insertOne(subject);
        return result;
    }

    // find
    async find(filter) {
        const cursor = await this.Subject.find(filter);
        return await cursor.toArray();
    }

    // findById
    async findById(id) {
        return await this.Subject.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    // findByAdminId
    async findByAdminId(id) {
        return await this.Subject.findOne({
            admin_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findByNameAndAdmin(subject_name, adminId, subjectId) {
        return await this.Subject.findOne({
            subject_name: subject_name,
            admin_id: ObjectId.isValid(adminId) ? new ObjectId(adminId) : null,
            _id: {
                $ne: ObjectId.isValid(subjectId) ? new ObjectId(subjectId) : null,
            }
        });
    }

    async findByCodeAndAdmin(subject_code, adminId, subjectId) {
        return await this.Subject.findOne({
            subject_code: subject_code,
            admin_id: ObjectId.isValid(adminId) ? new ObjectId(adminId) : null,
            _id: {
                $ne: ObjectId.isValid(subjectId) ? new ObjectId(subjectId) : null,
            }
        });
    }

    async findByCodeAndName(subject_code, subject_name, adminId) {
        const adminID = new ObjectId(adminId);
        const codeRegex = new RegExp(subject_code, 'i'); // Tạo regex cho tìm kiếm không phân biệt chữ hoa chữ thường theo mã môn học
        const nameRegex = new RegExp(subject_name, 'i'); // Tạo regex cho tìm kiếm không phân biệt chữ hoa chữ thường theo tên môn học
        return await this.Subject.find({
            admin_id: adminID,
            $or: [
                { subject_code: { $regex: codeRegex } },
                { subject_name: { $regex: nameRegex } },
            ],
        }).toArray();
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractSubjectData(payload);
        const result = await this.Subject.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    // delete
    async delete(id) {
        const result = await this.Subject.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // deleteAll
    async deleteAll(adminId) {
        const result = await this.Subject.deleteMany({admin_id: adminId});
        return result.deletedCount;
    }

    // check validate
    async checkValidate(subjectName, subjectCode, adminId, id, option) {
        if(option == 'add' || !id ){
            id = null
        }else if(option == 'update' || id){
            id = id;
        }
        const nameExist = await this.findByNameAndAdmin(subjectName, adminId, id);
        const codeExist = await this.findByCodeAndAdmin(subjectCode, adminId, id); 

        return { nameExist, codeExist};
    }
}

module.exports = SubjectService;
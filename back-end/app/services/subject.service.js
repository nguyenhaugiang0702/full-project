const { ObjectId } = require("mongodb");
class SubjectService {
    constructor(client) {
        this.Subject = client.db().collection("subjects");
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

    async findByNameAndAdmin(name, adminId) {
        return await this.Subject.findOne({ 
            subject_name: { $regex: new RegExp(`^${name}$`, 'i') },
            admin_id: ObjectId.isValid(adminId) ? new ObjectId(adminId) : null, 
        });
    }

    async findByCodeAndAdmin(code, adminId) {
        return await this.Subject.findOne({ 
            subject_code: { $regex: new RegExp(`^${code}$`, 'i') },
            admin_id: ObjectId.isValid(adminId) ? new ObjectId(adminId) : null,  
        });
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
    async deleteAll() {
        const result = await this.Subject.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = SubjectService;
const { ObjectId } = require("mongodb");
class QuestionService {
    constructor(client) {
        this.Question = client.db().collection("questions");
    }
    extractQuestionData(payload) {
        const question = {
            question_name: payload.question_name,
            subject_id: ObjectId.isValid(payload.subject_id) ? new ObjectId(payload.subject_id) : null,
            options: payload.options ? payload.options.map(option => ({
                answer: option.answer,
                is_correct: option.is_correct || false
            })) : []
        };
        // Remove undefined fields
        Object.keys(question).forEach(
            (key) => question[key] === undefined && delete question[key]
        );
        return question;
    }

    // create
    async create(payload) {
        const question = this.extractQuestionData(payload);
        const result = await this.Question.insertOne(question);
        return result;
    }

    async insertMany(questions) {
        const result = await this.Question.insertMany(questions);
        return result.ops;
    }

    // find
    async find(filter) {
        const cursor = await this.Question.find(filter);
        return await cursor.toArray();
    }

    // findById
    async findById(id) {
        return await this.Question.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findByNameAndSubject(question_name, subject_id) {
        return await this.Question.findOne({
            question_name: { $regex: new RegExp(question_name, 'i') },
            subject_id: ObjectId.isValid(subject_id) ? new ObjectId(subject_id) : null,
        });
    }

    async findByNameAndSubjectID(question_name, subject_id) {
        const nameRegex = new RegExp(question_name, 'i');
        return await this.Question.find({
            subject_id: ObjectId.isValid(subject_id) ? new ObjectId(subject_id) : null,
            question_name: { $regex: nameRegex },
        }).toArray();
    }

    async findBySubjectID(subject_id) {
        return await this.Subject.find({
            subject_id: ObjectId.isValid(subject_id) ? new ObjectId(subject_id) : null,
        }).toArray();
    }

    // Phương thức để đếm số câu hỏi theo subject_id
    async countBySubjectId(subject_id) {
        const count = await this.Question.countDocuments({ subject_id: new ObjectId(subject_id) });
        return count;
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractQuestionData(payload);
        const result = await this.Question.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    // delete
    async delete(id) {
        const result = await this.Question.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // deleteBySubjectId
    async deleteBySubjectId(subjectId) {
        const result = await this.Question.deleteMany({ subject_id: new ObjectId(subjectId) });
        return result.deletedCount;
    }

    shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    async aggregate(pipeline) {
        return await this.Question.aggregate(pipeline).toArray();
    }
}

module.exports = QuestionService;
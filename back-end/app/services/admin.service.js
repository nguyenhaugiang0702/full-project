const { ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');

class adminService {
    constructor(client) {
        this.Admin = client.db().collection("admin");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractAdminData(payload) {
        const admin = {
            admin_id: payload.admin_id,
            admin_name: payload.admin_name,
            admin_password: payload.admin_password,
            admin_email: payload.admin_email,
            admin_role: payload.admin_role || 'teacher',
        };
        // Remove undefined fields
        Object.keys(admin).forEach(
            (key) => admin[key] === undefined && delete admin[key]
        );
        return admin;
    }

    // create
    async create(payload) {
        const admin = this.extractAdminData(payload);
        const result = await this.Admin.insertOne(admin);
        return result.value;
    }

    //auth
    async authenticate(payload) {
        const adminData = this.extractAdminData(payload);
        const admin = await this.Admin.findOne({ admin_id: adminData.admin_id, admin_email: adminData.admin_email });
        const isPasswordValid = await bcrypt.compare(adminData.admin_password, admin.admin_password);

        if (isPasswordValid) {
            return admin;
        } else {
            throw new Error('Mật khẩu không đúng');
        }
    }

    // find
    async find(filter) {
        const cursor = await this.Admin.find(filter);
        return await cursor.toArray();
    }

    // findByName
    async findByAdminName(name, id, role) {
        return await this.Admin.findOne({
            admin_name: { $regex: new RegExp(name), $options: "i" },
            _id: {
                $ne: ObjectId.isValid(id) ? new ObjectId(id) : null,
            },
            admin_role: role
        });
    }

    // findByName
    async findByAdminNameAndEmail(name, email, role) {
        return await this.Admin.find({
            admin_role: role,
            $or: [
                { admin_name: { $regex: new RegExp(name), $options: "i" }, },
                { admin_email: { $regex: new RegExp(email), $options: "i" }, },
            ]
        }).toArray();
    }

    // findByName
    async findByAdminEmail(email, id, role) {
        return await this.Admin.findOne({
            admin_email: { $regex: new RegExp(email), $options: "i" },
            _id: {
                $ne: ObjectId.isValid(id) ? new ObjectId(id) : null,
            },
            admin_role: role
        });
    }

    async findByAdminID(adminId, id, role) {
        return await this.Admin.findOne({
            admin_id: adminId,
            _id: {
                $ne: ObjectId.isValid(id) ? new ObjectId(id) : null,
            },
            admin_role: role
        });
    }

    // findById
    async findById(id) {
        return await this.Admin.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findLatestAdminID(role) {
        const latestAdmin = await this.Admin.find({ admin_role: role }).sort({ admin_id: -1 }).limit(1).toArray();
        return latestAdmin.length > 0 ? latestAdmin[0].admin_id : null;
    }

    // update
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractAdminData(payload);

        const result = await this.Admin.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );

        return result;
    }

    // delete
    async delete(id) {
        const result = await this.Admin.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    // deleteAll
    async deleteAll() {
        const result = await this.Admin.deleteMany({});
        return result.deletedCount;
    }

    // check validate
    async checkValidate(adminName, adminEmail, adminId, id, role, option) {
        if(option == 'add' || !id ){
            id = null
        }else if(option == 'update' || id){
            id = id;
        }
        const nameExist = await this.findByAdminName(adminName, id, role);
        const emailExist = await this.findByAdminEmail(adminEmail, id, role);
        const IDExist = await this.findByAdminID(adminId, id, role);
        let latestID = null;    

        if (IDExist) {
            latestID = await this.findLatestAdminID(role);
        }

        return { nameExist, emailExist, IDExist, latestID };
    }
}
module.exports = adminService;

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
    async findByAdminName(name) {
        return await this.Admin.findOne({
            admin_name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // findByName
    async findByAdminNameAndEmail(name, email, role) {
        return await this.Admin.find({
            admin_role: role,
            $or: [
                {admin_name: { $regex: new RegExp(name), $options: "i" },},
                {admin_email: { $regex: new RegExp(email), $options: "i" },},
            ]
        }).toArray();
    }

    // findByName
    async findByAdminEmail(email) {
        return await this.Admin.findOne({
            admin_email: { $regex: new RegExp(email), $options: "i" },
        });
    }

    // findById
    async findById(id) {
        return await this.Admin.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
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

    // check
    async checkAdd(adminId, adminName, adminEmail) {
        const adminIdExist = await this.Admin.findOne({
            admin_id: adminId
        });
        if (adminIdExist) {
            throw new Error('ID da ton tai');
        }
        const adminNameExist = await this.Admin.findOne({
            admin_name: { $regex: new RegExp(adminName), $options: "i" },
        });
        if (adminNameExist) {
            throw new Error('Ten da ton tai');
        }
        const adminEmailExist = await this.Admin.findOne({
            admin_email: { $regex: new RegExp(adminEmail), $options: "i" },
        });
        if (adminEmailExist) {
            throw new Error('Email da duoc su dung');
        }
        return true;
    }
}
module.exports = adminService;

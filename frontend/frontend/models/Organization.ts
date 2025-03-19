import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
    email: string;
    username: string;
    password: string;
    orgName: string;
    address: string;
}

const OrganizationSchema: Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    orgName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
    },
});

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

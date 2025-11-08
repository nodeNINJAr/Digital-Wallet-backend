/* eslint-disable no-unused-vars */

import { Types } from "mongoose";

export enum Role {
    ADMIN="admin",
    USER="user",
    AGENT="agent"
}


export enum AgentStatus {
    PENDING="pending",
    APPROVED="approved",
    SUSPENDED="suspended",
    INITIAL=""
}


export enum IsActive{
    ACTIVE="active",
    INACTIVE="inactive",
    BLOCKED="blocked"
}



export interface IUser{
  _id?:Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  picture?:string;
  role: Role;
  isActive?: IsActive;
  isVerified?:boolean;
  agentStatus?:AgentStatus;
}




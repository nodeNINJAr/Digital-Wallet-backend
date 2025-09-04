/* eslint-disable no-unused-vars */

import { Types } from "mongoose";

export enum Role {
    ADMIN="ADMIN",
    USER="USER",
    AGENT="AGENT"
}


export enum AgentStatus {
    PENDING="PENDING",
    APPROVED="APPROVED",
    SUSPENDED="SUSPENDED",
    INITIAL=""
}


export enum IsActive{
    ACTIVE="ACTIVE",
    INACTIVE="INACTIVE",
    BLOCKED="BLOCKED"
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




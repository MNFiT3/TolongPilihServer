import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import config from "../config/config";
import { UserGroup } from "../entity/UserGroup";
import { Group } from "../entity/Group";
import { User } from "../entity/User";

export default class TolongPilihController {

    static checkUserAndGroup = async (groupId: any, userId: any, res: Response, callback: Function) => {
        if (!groupId) {
            res.send('Missing attibute groupId')
            callback(true)
        }

        let user: User
        try {
            user = await getRepository(User).findOneOrFail(userId)
        } catch (error) {
            res.status(401).send()
            callback(true)
        }

        let theGroup: Group
        try {
            theGroup = await getRepository(Group).findOneOrFail(groupId)
        } catch (error) {
            res.status(404).send('Group not found')
            callback(true)
        }

        callback(false, user, theGroup)
    }

    static joinGroup = async (req: Request, res: Response) => {
        const { groupId } = req.body
        const userId = res.locals.jwtPayload.userId


        TolongPilihController.checkUserAndGroup(groupId, userId, res, async (err, user, theGroup) => {
            if (!err) {
                let newUserGroup = new UserGroup()
                newUserGroup.group = theGroup
                newUserGroup.user = user

                const errors = await validate(newUserGroup);
                if (errors.length > 0) {
                    res.status(400).send(errors);
                    return;
                }

                const userGroupRepo = getRepository(UserGroup)
                try {
                    await userGroupRepo.save(newUserGroup)
                } catch (error) {
                    res.status(409).send()
                    return
                }

                res.status(204).send()
            }
        })
    }

    static leaveGroup = async (req: Request, res: Response) => {
        const { groupId } = req.body
        const userId = res.locals.jwtPayload.userId

        if (!groupId) {
            res.send('Missing attibute groupId')
            return
        }

        let user: User
        try {
            user = await getRepository(User).findOneOrFail(userId)
        } catch (error) {
            res.status(401).send()
            return
        }

        let theGroup: Group
        try {
            theGroup = await getRepository(Group).findOneOrFail(groupId)
        } catch (error) {
            res.status(404).send('Group not found')
            return
        }
    }

    static inviteGroup = async (req: Request, res: Response) => {

    }

    static addItems = async (req: Request, res: Response) => {

    }

    static removeItems = async (req: Request, res: Response) => {

    }

    static tolongPilih = async (req: Request, res: Response) => {

    }

}
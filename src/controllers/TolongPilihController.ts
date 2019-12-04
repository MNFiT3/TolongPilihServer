import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { UserGroup } from "../entity/UserGroup";
import { Group } from "../entity/Group";
import { User } from "../entity/User";

export default class TolongPilihController {

    static checkUserAndGroup = async (groupId: any, userId: any, res: Response, callback: Function) => {

        let user: User
        try {
            user = await getRepository(User).findOneOrFail(userId)
        } catch (error) {
            res.status(401).send()
            callback(true)
            return
        }

        let theGroup: Group
        try {
            theGroup = await getRepository(Group).findOneOrFail(groupId)
        } catch (error) {
            res.status(404).send('Group not found')
            callback(true)
            return
        }

        callback(false, user, theGroup)
        return
    }

    static createGroup = async (req: Request, res: Response) => {
        const { name } = req.body
        const userId = res.locals.jwtPayload.userId

        let user: User
        try {
            user = await getRepository(User).findOneOrFail(userId)
        } catch (error) {
            res.status(401).send()
            return
        }

        //Add new group
        let newGroup = new Group()
        newGroup.name = name

        var error = await validate(newGroup)
        if (error.length > 0) {
            res.status(400).send(error)
            return
        }

        let addedGroup: Group
        const groupRepo = getRepository(Group)
        try {
            addedGroup = await groupRepo.save(newGroup)
        } catch (error) {
            res.status(400).send()
            return
        }

        //Make link user and group table
        let newUserGroup = new UserGroup()
        newUserGroup.group = addedGroup
        newUserGroup.user = user
        newUserGroup.role = 'Admin'

        error = await validate(newUserGroup)
        if (error.length > 0) {
            res.send(400).send(error)
            return
        }

        const userGroupRepo = getRepository(UserGroup)
        try {
            await userGroupRepo.save(newUserGroup)
        } catch (error) {
            res.status(400).send()
            return
        }

        res.status(204).send()
    }

    static joinGroup = async (req: Request, res: Response) => {
        const { groupId } = req.body
        const userId = res.locals.jwtPayload.userId


        TolongPilihController.checkUserAndGroup(groupId, userId, res, async (err, user, group) => {
            if (!err) {
                let userGroup: UserGroup
                try {
                    userGroup = await getRepository(UserGroup).findOneOrFail({ user, group })
                } catch (error) {
                    //Not in the group
                    let newUserGroup = new UserGroup()
                    newUserGroup.group = group
                    newUserGroup.user = user
                    newUserGroup.role = 'Member'

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
                    return
                }

                if (userGroup != null) {
                    res.status(400).send("Already on the group");
                    return
                }
            }
        })
    }

    static leaveGroup = async (req: Request, res: Response) => {
        const { groupId } = req.body
        const userId = res.locals.jwtPayload.userId

        TolongPilihController.checkUserAndGroup(groupId, userId, res, async (err, user, group) => {
            let userGroup: UserGroup
            try {
                userGroup = await getRepository(UserGroup).findOneOrFail({ user, group })
            } catch (error) {
                res.status(409).send('User not exist in the group')
                return
            }

            //Pass admin to other members randomly
            if (userGroup.role == "Admin") {
                let newAdmin: UserGroup
                try {
                    newAdmin = await getRepository(UserGroup).findOneOrFail({ where: { role: 'Member', group } })
                } catch (error) {

                    //Delete user
                    try {
                        await getRepository(UserGroup).delete(userGroup.id)
                    } catch (error) {
                        res.status(409).send("Can't find user")
                        return
                    }

                    //Delete group
                    try {
                        await getRepository(Group).delete(groupId)
                    } catch (error) {
                        res.status(409).send("Can't delete group")
                        return
                    }

                    res.status(204).send()
                    return
                }

                //Delete user
                try {
                    getRepository(UserGroup).delete(userGroup.id)
                } catch (error) {
                    res.status(409).send("Can't find user")
                    return
                }

                newAdmin.role = 'Admin'
                await getRepository(UserGroup).save(newAdmin)
            }

            res.status(204).send()
        })
    }

    static inviteGroup = async (req: Request, res: Response) => {
        const { email, groupId } = req.body
        const userId = res.locals.jwtPayload.userId

        let invitedUser: User
        try {
            invitedUser = await getRepository(User).findOneOrFail({ email })
        } catch (error) {
            res.status(409).send("Email attribute missing")
            return
        }
        
        //TODO: check if user add himself
        console.log(invitedUser.id)
        console.log(userId)

        if(invitedUser.id == userId){
            res.send(409).send("But why?")
            return
        }

        let invitedToGroup: Group
        try {
            invitedToGroup = await getRepository(Group).findOneOrFail({ id: groupId })
        } catch (error) {
            res.status(409).send("groupId attribute missing")
            return
        }


        
        try {
            await getRepository(UserGroup).findOneOrFail({ user: invitedUser, group: invitedToGroup })
        } catch (error) {
            res.status(409).send()
            return
        }


        return

        let newMember = new UserGroup()
        newMember.group = invitedToGroup
        newMember.user = invitedUser
        newMember.role = 'Member'
        
        const error = await validate(UserGroup)
        if(error.length > 0){
            res.status(400).send(error)
            return
        }

        try {
            await getRepository(UserGroup).save(newMember)
        } catch (error) {
            res.status(409).send("Error adding user")
            return
        }

        res.status(204).send()
    }

    static addItems = async (req: Request, res: Response) => {

    }

    static removeItems = async (req: Request, res: Response) => {

    }

    static tolongPilih = async (req: Request, res: Response) => {

    }

}
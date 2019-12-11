import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { uuid } from 'uuidv4'; 

import { UserGroup } from "../entity/UserGroup";
import { Group } from "../entity/Group";
import { User } from "../entity/User";

export default class TolongPilihController {

    static checkUserAndGroup = async (groupId: any, res: Response, callback: Function) => {
        const userId = res.locals.jwtPayload.userId
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

    static test = async (req: Request, res: Response) => {
        console.log(JSON.parse(req.body.PostData))
        //res.json(req.body)
        res.send('Success')
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


        TolongPilihController.checkUserAndGroup(groupId, res, async (err, user, group) => {
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

        TolongPilihController.checkUserAndGroup(groupId, res, async (err, user, group) => {
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
            invitedUser = await getRepository(User).findOneOrFail({ where: { email: email } })
        } catch (error) {
            res.status(409).send("Email attribute missing")
            return
        }
        
        if(invitedUser.id == userId){
            res.status(409).send("Can't invite yourself")
            return
        }

        let invitedToGroup: Group
        try {
            invitedToGroup = await getRepository(Group).findOneOrFail({ id: groupId })
        } catch (error) {
            res.status(409).send("groupId attribute missing")
            return
        }

        const isInGroup = await getRepository(UserGroup).count({ user: invitedUser, group: invitedToGroup })

        if(isInGroup > 0){
            res.status(409).send('Already in the group')
            return
        }

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
        const { groupId, item } = req.body

        if(!item){
            res.status(409).send('item attribute missing')
            return
        }

        TolongPilihController.checkUserAndGroup(groupId, res, async (err, user: User, group: Group) => {

            let userGroup: UserGroup
            try {
                userGroup = await getRepository(UserGroup).findOneOrFail({ where: { user: user, group: group } })
            } catch (error) {
                res.status(409).send()
                return
            }

            if(userGroup.role != 'Admin'){
                res.status(409).send('Only admin can add item')
                return
            }

            if(group.list == null || group.list == ''){
                group.list = []
            }

            let isDuplicate = group.list.indexOf(item)
            if(isDuplicate != -1){
                res.status(409).send('Item with the same name already in the item list')
                return
            }

            group.list.push(item)

            try {
                await getRepository(Group).save(group)
            } catch (error) {
                res.status(409).send()
                return
            }

            res.status(204).send()
        })
    }

    static removeItems = async (req: Request, res: Response) => {
        const { groupId, item } = req.body

        if(!item){
            res.status(409).send('item attribute missing')
            return
        }

        TolongPilihController.checkUserAndGroup(groupId, res, async (err, user: User, group: Group) => {

            let userGroup: UserGroup
            try {
                userGroup = await getRepository(UserGroup).findOneOrFail({ where: { user: user, group: group } })
            } catch (error) {
                res.status(409).send()
                return
            }

            if(userGroup.role != 'Admin'){
                res.status(409).send('Only admin can remove item')
                return
            }

            if(group.list == null || group.list == ''){
                res.status(409).send('There is no item to delete')
                return
            }

            if(group.list.indexOf(item) == -1){
                res.status(404).send('The item does not exist in the list')
                return
            }

            group.list.splice( group.list.indexOf(item), 1 );

            try {
                await getRepository(Group).save(group)
            } catch (error) {
                res.status(409).send()
                return
            }

            res.status(204).send()
        })
    }

    static tolongPilih = async (req: Request, res: Response) => {
        const { groupId, item } = req.body

        TolongPilihController.checkUserAndGroup(groupId, res, async (err, user: User, group: Group) => {

            // const itemList = group.list
            // const min = Math.ceil(0);
            // const max = Math.floor(itemList.length);
            // const index = Math.floor(Math.random() * (max - min)) + min;

            if(group.history == null || group.history == ''){
                group.history = []
            }

            const date = new Date()
            const dT_UTC = date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds()
            
            delete user.password
            delete user.createdAt
            delete user.json
            
            const tolongPilih = {
                id: uuid(),
                dateTime: dT_UTC,
                initiator: user,
                result: item
            }
            group.history.push(tolongPilih)

            try {
                await getRepository(Group).save(group)
            } catch (error) {
                res.status(409).send()
                return
            }

            res.json(tolongPilih)
        })
    }

    static groupList = async (req: Request, res: Response) => {
        const userId = res.locals.jwtPayload.userId

        var groupList: UserGroup[]
        try {
            groupList = await getRepository(UserGroup).find({ where: { user: { id: userId }}, relations: ['group']})
        } catch (error) {
            res.status(409).send("Group not found")            
        }

        groupList.forEach( e => {
            delete e.json
            delete e.group.createdAt
            delete e.group.list
            delete e.group.history
            delete e.group.json
        })
        
        res.json(groupList)
    }

    static itemList = async (req: Request, res: Response) => {
        const { groupId } = req.body
        
        var group:Group
        try {
            group = await getRepository(Group).findOneOrFail({ where: { id: groupId}})
        } catch (error) {
            res.status(409).send("Group not exists")
            return
        }

        res.json(group)
    }
}
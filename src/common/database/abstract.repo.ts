import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AbstractSchema } from "./abstract.schema";
import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";


@Injectable()
export abstract class AbstractRepo<TSchema extends AbstractSchema> {

    private readonly logger = new Logger(AbstractRepo.name)

    constructor(private readonly model: Model<TSchema>) { }

    async create(document: Omit<TSchema, "_id">): Promise<TSchema> {
        const created = new this.model({
            ...document,
            _id: new Types.ObjectId()
        })

        return ((await created.save()).toJSON() as TSchema)
    }

    async findOne(filterQuery: FilterQuery<TSchema>): Promise<TSchema | null> {
        const document = this.model.findOne(filterQuery).lean<TSchema>(true)

        if (!document) {
            this.logger.warn(`Document not found with filter: ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException("Document not found")
        }

        return document;
    }

    async find(filterQuery: FilterQuery<TSchema>): Promise<TSchema[] | null> {
        const document = this.model.find(filterQuery).lean<TSchema[]>(true)

        if (!document) {
            this.logger.warn(`Documents not  found with filter: ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException("Documents not found")
        }
        return document;

         
    }

    async findOneAndUpdat(filterQuery: FilterQuery<TSchema>, updateQuery: UpdateQuery<TSchema>): Promise<TSchema | null> {
        const document = this.model.findOneAndUpdate(filterQuery, updateQuery, {
            new: true
        }).lean<TSchema>(true)

        if (!document) {
            this.logger.warn(`Document not found to update: ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException("Document not found to update")
        }

        return document;

    }

    async findOneAndDelete(filterQuery: FilterQuery<TSchema>): Promise<TSchema | null> {
        const document = this.model.findOneAndDelete(filterQuery).lean<TSchema>(true)

        if (!document) {
            this.logger.warn(`Document not found to delete: ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException("Document not found to delete")
        }

        return document;
    }
}
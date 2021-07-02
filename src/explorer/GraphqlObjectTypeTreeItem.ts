/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GraphQLArgument, GraphQLField, GraphQLFieldMap, GraphQLList, GraphQLObjectType, GraphQLOutputType } from "graphql";
import { AzExtTreeItem, AzureParentTreeItem } from "vscode-azureextensionui";
import { treeUtils } from "../utils/treeUtils";
import { GraphqlArgsTreeItem } from "./GraphqlArgsTreeItem";
import { GraphqlFieldsTreeItem } from "./GraphqlFieldsTreeItem";
import { IOperationTreeRoot } from "./IOperationTreeRoot";

// tslint:disable: no-any
export class GraphqlObjectTypeTreeItem extends AzureParentTreeItem<IOperationTreeRoot> {
    public static contextValue: string = 'azureApiManagementGraphqlObjectType';
    public contextValue: string = GraphqlObjectTypeTreeItem.contextValue;

    private _name: string;
    private _label: string;

    public get iconPath(): { light: string, dark: string } {
        return treeUtils.getThemedIconPath('op');
    }

    public get label() : string {
        return this._label;
    }

    public get id(): string {
        return this._name;
    }

    constructor(
        parent: AzureParentTreeItem,
        // tslint:disable-next-line: no-any
        public readonly object: GraphQLField<any, any, {
            // tslint:disable-next-line: no-any
            [key: string]: any;
        }>) {
        super(parent);
        this._label = object.name;
        this._name = object.name;
    }

    public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
        const args: GraphQLArgument[] = this.object.args;
        let allNodes: AzExtTreeItem[] = [];
        const argsNodes = await this.createTreeItemsWithErrorHandling(
            args,
            "invalidApiManagementGraphqlObjectTypes",
            async (objectType: GraphQLArgument) => new GraphqlArgsTreeItem(this, objectType),
            (objectType: GraphQLArgument) => {
                return objectType.name;
            });
        allNodes = allNodes.concat(argsNodes);

        const types: GraphQLOutputType = this.object.type;
        if (types instanceof GraphQLList && types.ofType instanceof GraphQLObjectType) {
            const objectTypes: GraphQLObjectType = types.ofType;
            const fields: GraphQLFieldMap<any, any> = objectTypes.getFields();
            const fieldValues = Object.values(fields);
            const fieldNodes = await this.createTreeItemsWithErrorHandling(
                fieldValues,
                "invalidApiManagementGraphqlObjectTypes",
                async (objectType: GraphQLField<any, any, {
                    [key: string]: any;
                }>) => new GraphqlFieldsTreeItem(this, objectType),
                (objectType: GraphQLField<any, any, {
                    [key: string]: any;
                }>) => {
                    return objectType.name;
                });
            allNodes = allNodes.concat(fieldNodes);
        } else if (types instanceof GraphQLObjectType) {
            const fields: GraphQLFieldMap<any, any> = types.getFields();
            const fieldValues = Object.values(fields);
            const fieldNodes = await this.createTreeItemsWithErrorHandling(
                fieldValues,
                "invalidApiManagementGraphqlObjectTypes",
                async (objectType: GraphQLField<any, any, {
                    [key: string]: any;
                }>) => new GraphqlFieldsTreeItem(this, objectType),
                (objectType: GraphQLField<any, any, {
                    [key: string]: any;
                }>) => {
                    return objectType.name;
                });
            allNodes = allNodes.concat(fieldNodes);
        }
        return allNodes;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
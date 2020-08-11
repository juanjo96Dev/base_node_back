import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRoleTable1511105183653 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'roles',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '10',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                    isNullable: false,
                }, {
                    name: 'name',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'defaultRole',
                    type: 'int',
                    length: '1',
                    default: '0',
                    isPrimary: false,
                    isNullable: false,
                },
            ],
        });
        await queryRunner.createTable(table);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('user');
    }

}

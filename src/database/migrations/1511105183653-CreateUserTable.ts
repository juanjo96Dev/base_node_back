import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1511105183653 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
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
                    name: 'surname',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'password',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'role',
                    type: 'int',
                    length: '10',
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

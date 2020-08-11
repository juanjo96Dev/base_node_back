import {MigrationInterface, QueryRunner, TableForeignKey} from 'typeorm';

export class AddRoleRelationToUserTable1543741971906 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_user_roles',
        columnNames: ['role'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createForeignKey('user', this.tableForeignKey);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('user', this.tableForeignKey);
    }

}

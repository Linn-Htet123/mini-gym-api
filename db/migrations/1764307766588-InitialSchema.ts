import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1764307766588 implements MigrationInterface {
  name = 'InitialSchema1764307766588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."member_registrations_registration_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "member_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_screenshot_url" character varying NOT NULL, "registration_status" "public"."member_registrations_registration_status_enum" NOT NULL DEFAULT 'pending', "rejection_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "member_id" uuid, "package_id" uuid, CONSTRAINT "PK_f9c347c257b72858ba2595ac9bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "membership_packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "price" numeric(10,2) NOT NULL, "duration_days" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1ca6012199de622c361eddc869" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start_date" date NOT NULL, "end_date" date NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "payment_amount" numeric(10,2) NOT NULL, "payment_screenshot_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "member_id" uuid, "package_id" uuid, "registration_id" uuid, CONSTRAINT "REL_4729117daccc3c02f206bf490a" UNIQUE ("registration_id"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."check_ins_check_in_status_enum" AS ENUM('allowed', 'denied')`,
    );
    await queryRunner.query(
      `CREATE TABLE "check_ins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "check_in_time" TIMESTAMP NOT NULL DEFAULT now(), "check_in_status" "public"."check_ins_check_in_status_enum" NOT NULL, "denial_reason" text, "member_id" uuid, "subscription_id" uuid, CONSTRAINT "PK_fac7f27bc829a454ad477c13f62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trainers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "specialization" character varying NOT NULL, "bio" text, "price_per_month" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_198da56395c269936d351ab774b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trainer_subscriptions_status_enum" AS ENUM('active', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trainer_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start_date" date NOT NULL, "end_date" date NOT NULL, "status" "public"."trainer_subscriptions_status_enum" NOT NULL DEFAULT 'active', "payment_amount" numeric(10,2) NOT NULL, "payment_screenshot_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "member_id" uuid, "trainer_id" uuid, CONSTRAINT "PK_b4d31a9a7e93738b0b95ef3ceef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying, "emergency_contact" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_da404b5fd9c390e25338996e2d" UNIQUE ("user_id"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('member', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'member', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('registration_submitted', 'registration_approved', 'registration_rejected', 'subscription_expiring', 'subscription_expired', 'membership_registered', 'check_in_denied', 'check_in_success')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "data" json, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_registrations" ADD CONSTRAINT "FK_052b9822a8e40658573a1d810b2" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_registrations" ADD CONSTRAINT "FK_1ed042f0a7b64e041db77bb5000" FOREIGN KEY ("package_id") REFERENCES "membership_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7cd08974422d9b17defa31e0dff" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_ed655e6276526f4f1b8167ff6be" FOREIGN KEY ("package_id") REFERENCES "membership_packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_4729117daccc3c02f206bf490ad" FOREIGN KEY ("registration_id") REFERENCES "member_registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_ins" ADD CONSTRAINT "FK_5a961354e6db2c8659e539f2176" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_ins" ADD CONSTRAINT "FK_8c77829bcb9db1d307421bc6502" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_subscriptions" ADD CONSTRAINT "FK_a8c9416eb387e1031858e34d215" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_subscriptions" ADD CONSTRAINT "FK_c6ec2674770a5bf3bb9a5ceea47" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_subscriptions" DROP CONSTRAINT "FK_c6ec2674770a5bf3bb9a5ceea47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_subscriptions" DROP CONSTRAINT "FK_a8c9416eb387e1031858e34d215"`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_ins" DROP CONSTRAINT "FK_8c77829bcb9db1d307421bc6502"`,
    );
    await queryRunner.query(
      `ALTER TABLE "check_ins" DROP CONSTRAINT "FK_5a961354e6db2c8659e539f2176"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_4729117daccc3c02f206bf490ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_ed655e6276526f4f1b8167ff6be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7cd08974422d9b17defa31e0dff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_registrations" DROP CONSTRAINT "FK_1ed042f0a7b64e041db77bb5000"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_registrations" DROP CONSTRAINT "FK_052b9822a8e40658573a1d810b2"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TABLE "trainer_subscriptions"`);
    await queryRunner.query(
      `DROP TYPE "public"."trainer_subscriptions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "trainers"`);
    await queryRunner.query(`DROP TABLE "check_ins"`);
    await queryRunner.query(
      `DROP TYPE "public"."check_ins_check_in_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    await queryRunner.query(`DROP TABLE "membership_packages"`);
    await queryRunner.query(`DROP TABLE "member_registrations"`);
    await queryRunner.query(
      `DROP TYPE "public"."member_registrations_registration_status_enum"`,
    );
  }
}

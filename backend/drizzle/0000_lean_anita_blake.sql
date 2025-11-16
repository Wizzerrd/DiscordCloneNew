CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"created_at" timestamp DEFAULT now(),
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"icon_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_members" (
	"server_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "server_members_server_id_user_id_pk" PRIMARY KEY("server_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"server_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"type" varchar DEFAULT 'friend' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "relationships_sender_id_receiver_id_type_pk" PRIMARY KEY("sender_id","receiver_id","type")
);
--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_relationships_sender" ON "relationships" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_relationships_receiver" ON "relationships" USING btree ("receiver_id");
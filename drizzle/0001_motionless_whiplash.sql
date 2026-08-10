CREATE TABLE "page_view" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"client_id" text,
	"path" text NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"last_heartbeat_at" timestamp,
	"referrer_path" text,
	"external_referrer_host" text,
	"visit_type" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"gclid" text,
	"fbclid" text,
	"is_bot" boolean DEFAULT false NOT NULL,
	"is_first_in_session" boolean DEFAULT false NOT NULL,
	"is_new_visitor" boolean DEFAULT false NOT NULL,
	"client_source" text,
	"user_agent" text,
	"ip_hash" text,
	"country" text
);
--> statement-breakpoint
CREATE TABLE "tracking_event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"client_id" text,
	"event_name" text NOT NULL,
	"path" text,
	"props" jsonb,
	"client_source" text,
	"ip_hash" text
);
--> statement-breakpoint
ALTER TABLE "page_view" ADD CONSTRAINT "page_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_event" ADD CONSTRAINT "tracking_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_view_created_idx" ON "page_view" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_view_session_path_idx" ON "page_view" USING btree ("session_id","path","created_at");--> statement-breakpoint
CREATE INDEX "page_view_path_created_idx" ON "page_view" USING btree ("path","created_at");--> statement-breakpoint
CREATE INDEX "page_view_client_created_idx" ON "page_view" USING btree ("client_id","created_at");--> statement-breakpoint
CREATE INDEX "page_view_user_created_idx" ON "page_view" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "tracking_event_created_idx" ON "tracking_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tracking_event_name_created_idx" ON "tracking_event" USING btree ("event_name","created_at");--> statement-breakpoint
CREATE INDEX "tracking_event_session_idx" ON "tracking_event" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "tracking_event_user_created_idx" ON "tracking_event" USING btree ("user_id","created_at");
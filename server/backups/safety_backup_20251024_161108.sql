--
-- PostgreSQL database dump
--

\restrict 9624ghV0MgW74Xx2m2fsKINj7iZK90OSNME9ed0ewPgROiY33mFwRSxBzhmcwMU

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Match; Type: TABLE; Schema: public; Owner: emile
--

CREATE TABLE public."Match" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration integer
);


ALTER TABLE public."Match" OWNER TO emile;

--
-- Name: MatchPlayer; Type: TABLE; Schema: public; Owner: emile
--

CREATE TABLE public."MatchPlayer" (
    id integer NOT NULL,
    "matchId" integer NOT NULL,
    "userId" integer NOT NULL,
    "finishPosition" integer,
    "timeMs" integer,
    "deltaElo" integer
);


ALTER TABLE public."MatchPlayer" OWNER TO emile;

--
-- Name: MatchPlayer_id_seq; Type: SEQUENCE; Schema: public; Owner: emile
--

CREATE SEQUENCE public."MatchPlayer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MatchPlayer_id_seq" OWNER TO emile;

--
-- Name: MatchPlayer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emile
--

ALTER SEQUENCE public."MatchPlayer_id_seq" OWNED BY public."MatchPlayer".id;


--
-- Name: Match_id_seq; Type: SEQUENCE; Schema: public; Owner: emile
--

CREATE SEQUENCE public."Match_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Match_id_seq" OWNER TO emile;

--
-- Name: Match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emile
--

ALTER SEQUENCE public."Match_id_seq" OWNED BY public."Match".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: emile
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    elo integer DEFAULT 1200 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "matchesPlayed" integer DEFAULT 0 NOT NULL,
    wins integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO emile;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: emile
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO emile;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: emile
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: emile
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO emile;

--
-- Name: Match id; Type: DEFAULT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."Match" ALTER COLUMN id SET DEFAULT nextval('public."Match_id_seq"'::regclass);


--
-- Name: MatchPlayer id; Type: DEFAULT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."MatchPlayer" ALTER COLUMN id SET DEFAULT nextval('public."MatchPlayer_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Match; Type: TABLE DATA; Schema: public; Owner: emile
--

COPY public."Match" (id, "createdAt", duration) FROM stdin;
\.


--
-- Data for Name: MatchPlayer; Type: TABLE DATA; Schema: public; Owner: emile
--

COPY public."MatchPlayer" (id, "matchId", "userId", "finishPosition", "timeMs", "deltaElo") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: emile
--

COPY public."User" (id, email, username, password, elo, "createdAt", "matchesPlayed", wins) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: emile
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2e37ccdd-b86c-4214-a1fe-b2c33eaac637	7885b7ad7c0aba9bef50a0e1a8fdeb103db6556494ef6f8dda1b07c8127a3f33	2025-10-24 16:10:54.726044+01	20251024151054_init	\N	\N	2025-10-24 16:10:54.714355+01	1
\.


--
-- Name: MatchPlayer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emile
--

SELECT pg_catalog.setval('public."MatchPlayer_id_seq"', 1, false);


--
-- Name: Match_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emile
--

SELECT pg_catalog.setval('public."Match_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: emile
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: MatchPlayer MatchPlayer_pkey; Type: CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY (id);


--
-- Name: Match Match_pkey; Type: CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."Match"
    ADD CONSTRAINT "Match_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: emile
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: emile
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: MatchPlayer MatchPlayer_matchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES public."Match"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MatchPlayer MatchPlayer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emile
--

ALTER TABLE ONLY public."MatchPlayer"
    ADD CONSTRAINT "MatchPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 9624ghV0MgW74Xx2m2fsKINj7iZK90OSNME9ed0ewPgROiY33mFwRSxBzhmcwMU


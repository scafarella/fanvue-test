# Security
1. I'd protect the APIs with jwt token. These APIs are intended for internal usage, so additional check using claims/scopes are required to make sure that the user is allowed to call the endpoint

# Data model
1. entity defined  in `types.ts`

2. I'd evolve this datamodel introducing a persistence layer using a well document library that support ORM mapping (e.g. typeORM).
The entities would map to the tables and dedicated script would be used for applying schema migrations, so that during the release lifecycle the latest script are run and new changes are applied (keeping backward compatibility in mind)

3. I'd implement auditing as a platform feature, publishing topic for auditable data capturing who/what/when and storing in a separate db where access is limited and granted to allowed staff

4. Fraud signals pick signals from different part of the platform/domains. Then a model can take decision and apply decision impacting differen domains e.g. block user, block payout. It should be a system on its own that receive event and emit decisions enforce by the correct domain (.e.g payment domain will act blocking payout)


# LLM prompt
I tried to cover e2e verticals (payout, payout by id and decision). I used the following prompt

generate types
generate seed
generate endpoint to get payout
generate frontend to consume payout 
generate endpoint to get payout by id
generate frontend to consume payout by id
generate endpoint for decisions
refactor to have every endpoint in a separate handler file and function
generate snapshot testing
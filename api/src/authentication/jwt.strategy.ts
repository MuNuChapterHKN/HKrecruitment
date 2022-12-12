import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

interface Auth0Config {
  issuer_url: string;
  audience: string;
}

const authConfig = (configService: ConfigService): Auth0Config => configService.get<Auth0Config>("AUTH0");

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: authConfig(configService).issuer_url + ".well-known/jwks.json",
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: authConfig(configService).audience,
      issuer: authConfig(configService).issuer_url,
      algorithms: ["RS256"],
    });
  }

  validate(payload: unknown): unknown {
    return payload;
  }
}
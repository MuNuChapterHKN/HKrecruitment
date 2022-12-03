import {Container, ContainerModule, decorate, injectable} from "inversify";
import {mySequelize} from "../dbconfig/dbconnector";
import {Sequelize} from "sequelize";
import {TYPES} from "./types";
import {Controller} from "tsoa";
import {buildProviderModule} from "inversify-binding-decorators";

const thirdPartyDependencies = new ContainerModule((bind) => {
    bind<Sequelize>(TYPES.Sequelize).toConstantValue(mySequelize);
});

const iocContainer = new Container();
decorate(injectable(), Controller);
iocContainer.load(buildProviderModule());
iocContainer.load(thirdPartyDependencies);

export { iocContainer };

import { AsyncModuleConfig } from '@golevelup/nestjs-modules';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { OgmaModuleOptions, Type } from './interfaces';
import {
  createLoggerProviders,
  createRequestScopedLoggerProviders,
} from './ogma.provider';
import { OgmaCoreModule } from './ogma-core.module';
import { OgmaProviderOptions } from './interfaces/ogma-provieder-options.interface';

@Module({
  /* imports: [OgmaCoreModule.Deferred],
  exports: [OgmaCoreModule], */
})
export class OgmaModule {
  static forRoot(options: OgmaModuleOptions): DynamicModule {
    return OgmaCoreModule.forRoot(OgmaCoreModule, options);
  }

  static forRootAsync(
    options: AsyncModuleConfig<OgmaModuleOptions>,
  ): DynamicModule {
    return OgmaCoreModule.forRootAsync(OgmaCoreModule, options);
  }

  /**
   *  Creates a new OgmaService based on the given context and possible options.
   * Original options from the `forRoot` or `forRootAsync` options are merged with new options
   *
   * @param context string context for the OgmaService to use in logging
   * @param options object options in creation of OgmaService
   * @param options.addRequestId boolean if logger should add requestId to each log
   */
  static forFeature(
    context: string | (() => any) | Type<any>,
    options: OgmaProviderOptions = { addRequestId: false },
  ): DynamicModule {
    const providers: Provider[] = this.createProviders(context, options);
    return {
      imports: [OgmaCoreModule.externallyConfigured(OgmaCoreModule, 0)],
      module: OgmaModule,
      providers,
      exports: providers,
    };
  }

  static forFeatures(
    contexts: Array<
      | {
          context: string | (() => any) | Type<any>;
          options: OgmaProviderOptions;
        }
      | string
      | (() => any)
      | Type<any>
    >,
  ): DynamicModule {
    const providers: Provider[] = contexts.map((ctx) => {
      if (typeof ctx === 'object') {
        return this.createProviders(ctx.context, ctx.options)[0];
      }
      return this.createProviders(ctx)[0];
    });
    return {
      module: OgmaModule,
      imports: [OgmaCoreModule.externallyConfigured(OgmaCoreModule, 0)],
      providers,
      exports: providers,
    };
  }

  private static createProviders(
    context: string | (() => any) | Type<any>,
    options: OgmaProviderOptions = { addRequestId: false },
  ): Provider[] {
    if (options.addRequestId) {
      return createRequestScopedLoggerProviders(context);
    }

    return createLoggerProviders(context);
  }
}

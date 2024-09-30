interface ImportMetaEnv {
  RONIN_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'ronin' {
  interface UsersGetter
    extends RONIN.IGetterPlural<unknown, Array<unknown>, 'users', never> {}

  export namespace RONIN {
    export interface Getter {
      users: UsersGetter;
    }
  }
}

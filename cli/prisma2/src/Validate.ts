import { Command, format, HelpError, getSchemaPath, arg } from '@prisma/cli'
import chalk from 'chalk'
import { getConfig, getDMMF } from '@prisma/sdk'
import fs from 'fs'

/**
 * $ prisma migrate new
 */
export class Validate implements Command {
  public static new(): Validate {
    return new Validate()
  }

  // static help template
  private static help = format(`
    Validate a schema.

    ${chalk.bold('Usage')}

    With an existing schema.prisma, just
      ${chalk.bold('prisma2 validate')}
    
    Or specify a schema:
      ${chalk.bold('prisma2 validate --schema=./schema.prisma')}

  `)
  private constructor() {}

  // parse arguments
  public async parse(argv: string[]): Promise<string | Error> {
    const args = arg(argv, {
      '--help': Boolean,
      '-h': '--help',
      '--schema': String,
    })

    if (args instanceof Error) {
      return this.help(args.message)
    }

    if (args['--help']) {
      return this.help()
    }

    let schemaPath: string | null = args['--schema'] || (await getSchemaPath())
    if (!schemaPath) {
      throw new Error(
        `Either provide ${chalk.greenBright(
          '--schema',
        )} or make sure that you are in a folder with a ${chalk.greenBright('schema.prisma')} file.`,
      )
    }

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Provided schema at ${schemaPath} doesn't exist.`)
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8')

    await getDMMF({
      datamodel: schema,
    })

    await getConfig({
      datamodel: schema,
    })

    return `The schema at ${chalk.underline(schemaPath)} is valid 🚀`
  }

  // help message
  public help(error?: string): string | HelpError {
    if (error) {
      return new HelpError(`\n${chalk.bold.red(`!`)} ${error}\n${Validate.help}`)
    }
    return Validate.help
  }
}

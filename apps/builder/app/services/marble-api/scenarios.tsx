import type { PlainMessage } from '@bufbuild/protobuf';
import { faker } from '@faker-js/faker';
import type { Scenario } from '@marble-front/api/marble';

function generateFakeScenarios(): PlainMessage<Scenario>[] {
  return Array.from({
    length: 25,
  }).map(() => {
    const versions = Array.from({
      length: Math.max(Math.floor(Math.random() * 10), 1),
    }).map((_) => ({
      id: faker.database.mongodbObjectId(),
      rules: Array.from({
        length: Math.max(Math.floor(Math.random() * 10), 1),
      }).map((_) => ({
        id: faker.database.mongodbObjectId(),
        name: faker.name.fullName(),
        description: faker.lorem.sentences(),
        orGroups: [],
      })),
    }));

    return {
      id: faker.database.mongodbObjectId(),
      name: faker.name.fullName(),
      description: faker.lorem.sentences(),
      mainTable: faker.name.lastName(),
      versions,
      activeVersion: versions?.[versions?.length - 1],
    };
  });
}

const fakeScenarios = [
  {
    id: '0dce62bb2dbecce00ffa3ef0',
    name: 'Ross Emmerich',
    description:
      'Rerum architecto suscipit sed exercitationem distinctio cumque pariatur tenetur ut. Exercitationem vel dolore non dignissimos. Occaecati itaque autem voluptate quos vitae facere.',
    mainTable: 'Senger',
    versions: [
      {
        id: '858bd3f8c0b8a5cacd05c0ad',
        rules: [
          {
            id: 'a1073cdbdef7d05fd34f1eee',
            name: 'Mrs. Krista Herman I',
            description:
              'Illum veritatis odio corrupti quis. Ab quo eos excepturi doloremque debitis neque consectetur nemo.',
            orGroups: [],
          },
          {
            id: 'e6acf2ac3496ebf85eb49afb',
            name: 'Susie Adams',
            description:
              'Beatae dignissimos amet consequuntur. Voluptate sit facilis ipsa tempore est. Ex facilis voluptate dicta. Aliquam deserunt rem aliquid odio quisquam iste voluptatem. Aliquid tenetur possimus. Consectetur repellendus molestias consequatur rerum.',
            orGroups: [],
          },
          {
            id: '2ce48eacac48bfa2cdf82db8',
            name: 'Helen Tremblay',
            description:
              'Voluptatem iure rem commodi asperiores laboriosam cumque. Modi alias nihil quo ipsum nihil voluptatem eligendi cum. Ipsa consectetur aliquam itaque consequatur nobis eligendi unde sunt. Quis eum voluptatem esse facere ratione debitis consectetur. Ex officia incidunt fuga at provident. Deserunt possimus sint hic.',
            orGroups: [],
          },
          {
            id: '8a4aa50522edcac71be2ad1e',
            name: 'Irving Boyle',
            description:
              'Et delectus fugiat. Facilis modi temporibus facilis ab quasi voluptatem. Eius voluptates perferendis saepe perspiciatis enim eveniet facilis veritatis. Aut saepe aut vel rem quo perspiciatis tempore.',
            orGroups: [],
          },
          {
            id: '7ffc022dbfabf2d6b1aac57a',
            name: 'Randall Prosacco',
            description:
              'Et possimus aperiam vero rerum deserunt consequatur. Eos tenetur nostrum velit itaque sapiente incidunt officiis sint. Quod id fugiat veniam.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c641db062faa82f736d598bb',
        rules: [
          {
            id: 'd60a99cafdbe8df471b45e1d',
            name: 'Jamie Hamill',
            description:
              'Explicabo eveniet modi. Perspiciatis tempora nesciunt similique quis. Saepe illum excepturi eveniet modi hic omnis quidem sint. In nostrum temporibus quae vero aliquid nobis est architecto nostrum. Iure porro nisi.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bafbf248de14adcfb0b14fbd',
        rules: [
          {
            id: 'ce7d9e3cd312c6e1a3dfd842',
            name: 'Edmond Sawayn',
            description:
              'Minus eius soluta nobis nam vero a. Consequatur expedita corporis sequi aperiam excepturi exercitationem iure illo. Aperiam voluptatum dolorum. Minus sequi ullam deserunt voluptas cum vero eius. Eaque tenetur est fugiat est qui aut ex itaque.',
            orGroups: [],
          },
          {
            id: 'f0ba34dcdad57b4ae13b3d14',
            name: 'Mae Champlin',
            description:
              'Praesentium eveniet quidem. Quidem inventore ab et eum quod at accusantium voluptatibus iure. Natus itaque possimus unde voluptatum explicabo. Vero ullam ullam. Possimus est minus voluptatum eos placeat veritatis alias.',
            orGroups: [],
          },
          {
            id: 'ed36bb4e23c0cf674d2d9a20',
            name: 'Patrick Kuvalis',
            description:
              'Sed neque tempore corporis aspernatur inventore ratione fuga. Voluptates quas sapiente fuga exercitationem odio nostrum. Accusamus similique reiciendis veniam possimus provident labore est id.',
            orGroups: [],
          },
          {
            id: 'e5cabf0ae1cea3a2be3f95b0',
            name: 'Miss Fannie Ortiz',
            description:
              'Doloremque quam explicabo nostrum at mollitia. Eos quod ipsa id sapiente sit. Numquam quibusdam nostrum at suscipit. Quod fugit veniam iste quae necessitatibus nam.',
            orGroups: [],
          },
          {
            id: 'cb65fd4ffaaa1b0af2cf166c',
            name: 'Anne Kozey',
            description:
              'Fuga repellat nemo. Ipsam tempore omnis esse autem saepe nam. Accusantium laborum illum est aspernatur omnis culpa. Quas nobis tempore blanditiis quaerat. Ex quibusdam tempora quidem exercitationem. Quisquam ab ab suscipit.',
            orGroups: [],
          },
          {
            id: '8cafcbe1d8ffe6d9efba803a',
            name: 'Betsy Hane',
            description:
              'Ratione placeat ut amet sint perspiciatis numquam cumque dolore eaque. Repellendus dicta perspiciatis ullam repellendus quia temporibus reprehenderit.',
            orGroups: [],
          },
          {
            id: 'e3b4beec0abaebc2c4d634c0',
            name: 'Heather Rutherford',
            description:
              'Nostrum iste odio consequuntur beatae molestias. Et et voluptatibus accusamus corporis. Eaque dolorum eius architecto vero alias. Voluptates reiciendis nesciunt ipsam animi. Totam veritatis eum illum hic vitae commodi corporis quidem similique. Repudiandae quod quam tempora corporis atque vero numquam soluta provident.',
            orGroups: [],
          },
          {
            id: '3083d594dadde29475bfb622',
            name: 'Gregory Frami',
            description:
              'Quod unde quas magnam quibusdam. Debitis aut aspernatur eius culpa officia mollitia debitis. Doloribus asperiores ut quia sequi eum totam. Provident nemo distinctio ab doloribus. Repellendus reiciendis aliquid repellendus cupiditate. Est in similique at amet quasi delectus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '909bdfbc2beeaac8783bf0cb',
        rules: [
          {
            id: '03bfc31997bbd81ccab1d5ec',
            name: 'Randall Beer',
            description:
              'Natus libero deserunt eius deserunt quod mollitia tempore. Quia nobis quo laboriosam quae. Illum ut veritatis. Rem ducimus ipsum maxime fugit rem labore ad perferendis.',
            orGroups: [],
          },
          {
            id: 'e5357ca89bfdd706177d043a',
            name: 'Bethany Leuschke',
            description:
              'Facere ratione veritatis placeat quaerat animi repudiandae aut. Harum optio illo quas ipsam impedit alias nostrum cumque. Nesciunt delectus quis odit. Magni maiores perspiciatis fugit quas hic ipsa asperiores. Nihil animi iusto provident nobis similique.',
            orGroups: [],
          },
          {
            id: 'dc3ea020cd100e1dcedf8f76',
            name: 'Katie Waelchi',
            description:
              'Libero quibusdam eius distinctio accusantium repellat sint cumque. Illum corporis ut enim pariatur dignissimos harum officia. Error facere sit maxime. Dolore ea deleniti quam reprehenderit reiciendis consectetur. Explicabo nobis provident nemo temporibus error amet nulla placeat asperiores.',
            orGroups: [],
          },
          {
            id: '81dada0cf1a6f5f20adcdaf2',
            name: 'Lonnie Krajcik',
            description:
              'Numquam aperiam suscipit maxime in totam architecto cum natus impedit. Reiciendis voluptate voluptas quibusdam doloremque. Dolorem soluta voluptatibus et atque dolorem. Deserunt assumenda tempore et doloribus maiores doloribus voluptas voluptatibus tenetur.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '909bdfbc2beeaac8783bf0cb',
      rules: [
        {
          id: '03bfc31997bbd81ccab1d5ec',
          name: 'Randall Beer',
          description:
            'Natus libero deserunt eius deserunt quod mollitia tempore. Quia nobis quo laboriosam quae. Illum ut veritatis. Rem ducimus ipsum maxime fugit rem labore ad perferendis.',
          orGroups: [],
        },
        {
          id: 'e5357ca89bfdd706177d043a',
          name: 'Bethany Leuschke',
          description:
            'Facere ratione veritatis placeat quaerat animi repudiandae aut. Harum optio illo quas ipsam impedit alias nostrum cumque. Nesciunt delectus quis odit. Magni maiores perspiciatis fugit quas hic ipsa asperiores. Nihil animi iusto provident nobis similique.',
          orGroups: [],
        },
        {
          id: 'dc3ea020cd100e1dcedf8f76',
          name: 'Katie Waelchi',
          description:
            'Libero quibusdam eius distinctio accusantium repellat sint cumque. Illum corporis ut enim pariatur dignissimos harum officia. Error facere sit maxime. Dolore ea deleniti quam reprehenderit reiciendis consectetur. Explicabo nobis provident nemo temporibus error amet nulla placeat asperiores.',
          orGroups: [],
        },
        {
          id: '81dada0cf1a6f5f20adcdaf2',
          name: 'Lonnie Krajcik',
          description:
            'Numquam aperiam suscipit maxime in totam architecto cum natus impedit. Reiciendis voluptate voluptas quibusdam doloremque. Dolorem soluta voluptatibus et atque dolorem. Deserunt assumenda tempore et doloribus maiores doloribus voluptas voluptatibus tenetur.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'bbddfca5ccded9cf6da6f3e8',
    name: 'Cameron Champlin',
    description:
      'Esse eligendi totam tempore ipsa aliquid. Adipisci quisquam earum porro. Placeat eum accusantium explicabo.',
    mainTable: 'Lindgren',
    versions: [
      {
        id: '6af4cf2e0168bfbcb823a89f',
        rules: [
          {
            id: 'ba2cf6eacefb77ed28e65e1b',
            name: 'Katherine Goyette',
            description:
              'Nam minus blanditiis hic sit minima. Repudiandae atque fuga eos vel adipisci. Inventore quia rerum. Sequi nostrum consequatur recusandae doloribus itaque commodi. Natus atque corrupti sapiente corrupti quod dolorum harum. Aperiam perspiciatis iste aut a pariatur.',
            orGroups: [],
          },
          {
            id: 'afe2522dc9616b3f4ee7eed0',
            name: 'Jay Pouros MD',
            description:
              'Corrupti doloribus est saepe maiores. Odio occaecati sapiente optio consequuntur. Architecto corporis fuga ducimus tempora doloremque nesciunt voluptate similique.',
            orGroups: [],
          },
          {
            id: '023b31fba403ca1a7dfb1e5e',
            name: 'Terrence Towne',
            description:
              'Dignissimos perspiciatis aliquam sunt eius velit odit. Veniam optio assumenda illo fugiat voluptatem est vitae voluptatum laborum. Quidem quisquam sapiente. Ea non reprehenderit dignissimos temporibus omnis.',
            orGroups: [],
          },
          {
            id: 'dafe2160c0b6925ecbad30d8',
            name: 'Neil Nienow',
            description:
              'Velit libero asperiores unde nesciunt ea laborum necessitatibus recusandae. Illo vitae consectetur ex. Consequuntur consectetur eaque sequi repellat quia illo ab qui tempore. Adipisci quae voluptatem dolore facere occaecati quisquam. Nostrum dolores blanditiis occaecati cumque error nulla nihil. Animi minus nobis reprehenderit nisi qui hic eaque magni.',
            orGroups: [],
          },
          {
            id: '2be6add2fddb7d56afd2a0eb',
            name: 'Percy Langworth',
            description:
              'Veniam quaerat dolor eos quibusdam expedita accusantium deleniti autem. Adipisci aperiam accusamus illum. Molestiae veritatis eos porro hic dolorum architecto libero voluptas. Facilis dignissimos tempore quasi saepe consectetur eaque. Quia rem quam occaecati quam placeat.',
            orGroups: [],
          },
          {
            id: 'ae38a53cef3b1b0ba8c476f4',
            name: 'Mrs. Marta Friesen Jr.',
            description:
              'Eligendi accusamus consectetur. Nihil recusandae mollitia doloribus aliquam tenetur earum amet. Eius animi corrupti voluptas recusandae ducimus itaque sed unde. Aliquid nihil occaecati. Id iure nobis eligendi quam autem distinctio. Aut provident natus delectus.',
            orGroups: [],
          },
          {
            id: 'b0cccdb22d1acdcc63cdbeda',
            name: 'Dr. Sheri Renner',
            description:
              'Blanditiis veritatis dolorum quo voluptate. Adipisci quasi quo eos distinctio perspiciatis. Ipsam veniam suscipit aut voluptatem perferendis similique. Eius quidem optio atque consectetur. Dicta cupiditate tempore suscipit blanditiis nobis nam neque est. Porro ducimus minus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '7bcc81afceaff329f5dda5fb',
        rules: [
          {
            id: 'b9ccd82cabedcc3c853d6a87',
            name: 'Terence Zboncak',
            description:
              'Iusto facere adipisci doloribus eveniet ut rerum dolores. Sit vel saepe. Quisquam dolorum similique quasi eos facilis enim. Praesentium assumenda placeat consectetur nam atque nam odit. Tempore dolores dolore quidem quaerat quaerat quis. At dolore temporibus asperiores dicta dignissimos cumque voluptates.',
            orGroups: [],
          },
          {
            id: '6302a0fe2fe7c8f873a671ff',
            name: 'Jennifer Haley',
            description:
              'Tenetur modi voluptates. Magnam dolorum architecto eaque omnis adipisci ullam perferendis exercitationem alias. Sit voluptatem quisquam temporibus saepe sint. Consequuntur minus vero voluptatibus quam ut debitis numquam molestiae rerum. Velit rerum nihil voluptatem dignissimos necessitatibus nam voluptatum repellendus aut.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ced8dcd8db2e597fa44961fb',
        rules: [
          {
            id: '66402eedeecc64bd4fbedd6d',
            name: 'Eula Kunde',
            description:
              'Dicta sapiente tempore illo sint ducimus deserunt. Quo nobis eos quam.',
            orGroups: [],
          },
          {
            id: '3af7cfcba6d76a20df338a46',
            name: 'Katie Maggio',
            description:
              'Fugit cum delectus quia. Rem culpa molestiae dolorem unde provident quibusdam.',
            orGroups: [],
          },
          {
            id: 'edab0bc7ccdb01c0dc7a66bf',
            name: 'Deborah Mertz',
            description:
              'Laudantium necessitatibus earum optio neque fuga dolor sit perspiciatis sapiente. Quos cum ullam recusandae perspiciatis. Maiores tenetur eaque neque. Sint et suscipit. A nostrum hic dolores.',
            orGroups: [],
          },
          {
            id: 'bf699bd4b91ecc173c3ac1ee',
            name: 'Gregory Turcotte',
            description:
              'Vel omnis fuga quibusdam. Quasi recusandae harum adipisci reiciendis. Illum aliquid odit earum. Impedit repellendus sunt laboriosam cupiditate harum tenetur sapiente.',
            orGroups: [],
          },
        ],
      },
      {
        id: '9cae1fb118adc45dceae69ef',
        rules: [
          {
            id: 'b2433a8e6d9be2737bedfae9',
            name: 'Leonard Stracke',
            description:
              'Iste optio expedita excepturi est nam saepe cupiditate laboriosam cum. Totam reprehenderit dolorem. Illum numquam sequi provident minima necessitatibus quaerat dignissimos impedit quia. Ut sed hic similique modi. Vero ipsum odit quaerat saepe adipisci quo unde ducimus. Optio quod numquam commodi quod quisquam beatae.',
            orGroups: [],
          },
          {
            id: '8f9aa191abffcdfa07390331',
            name: 'Dr. Rosa Kozey',
            description:
              'Doloremque pariatur sint vitae non nam. Culpa eaque in consequatur doloribus dolorem tempore consequatur. Voluptatibus alias occaecati similique itaque sapiente.',
            orGroups: [],
          },
          {
            id: '4a290ebbbdfe942acef1523d',
            name: 'Leslie Bauch',
            description:
              'Nobis adipisci modi pariatur architecto nihil ad. Suscipit voluptate odit excepturi placeat sint ipsa temporibus. Itaque dolor quaerat culpa repudiandae ducimus quia architecto blanditiis. Blanditiis id id ratione architecto.',
            orGroups: [],
          },
          {
            id: 'cd57efdae9bbee7dadbc48db',
            name: 'Juanita Windler',
            description:
              'Inventore iure deserunt unde nam temporibus expedita in non. Rerum iusto temporibus. Cupiditate reiciendis repellendus. Aut expedita praesentium voluptatum in quos modi debitis aspernatur harum. Corporis optio deleniti deleniti.',
            orGroups: [],
          },
          {
            id: '33064625d58c2418ed5abdf2',
            name: "Ryan O'Conner",
            description:
              'Vero eos assumenda. Omnis amet veritatis fuga similique nobis esse ratione. Dolor error aspernatur unde eum quae. Cum voluptas error aut placeat eligendi reprehenderit temporibus quo. Debitis commodi omnis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c206d9abfbd2c251cf7ac2db',
        rules: [
          {
            id: '0ce0a2acdfcccd1fcc5d2ec0',
            name: 'Jody Walsh',
            description:
              'Modi ipsa enim repudiandae in laborum. Dignissimos sed dignissimos itaque dolore dolore molestiae incidunt fugit. Iusto molestiae inventore nisi beatae. Officiis laborum quibusdam odit laboriosam nam debitis. Quia et voluptatum totam sed optio perferendis provident ratione. Quidem vitae reprehenderit accusamus quaerat molestias corporis explicabo.',
            orGroups: [],
          },
          {
            id: 'a0b8e42e5e43ecdf23add092',
            name: 'Percy Marvin',
            description:
              'Debitis fugit saepe debitis ipsa nemo consequatur veritatis. Quas hic dignissimos ipsam cum nemo accusamus necessitatibus. Placeat repellendus dolores tempore expedita accusantium et voluptatem.',
            orGroups: [],
          },
          {
            id: '3ae75bfd8fb3caad3adf4d29',
            name: 'Marjorie Lynch DVM',
            description:
              'Cupiditate officia tempora reiciendis nihil maxime voluptatibus quis deserunt ex. Id omnis expedita quibusdam.',
            orGroups: [],
          },
          {
            id: '5a31fb64e4bcc01fedba5c61',
            name: 'Derek Dicki',
            description:
              'Reprehenderit voluptas vel adipisci id aspernatur ab. Quia saepe consectetur architecto quia maiores cumque. Vitae at illum aut neque. Quasi cum magni sit officia totam tempore.',
            orGroups: [],
          },
          {
            id: '2ddbbf9efe5871ab67a21d2e',
            name: 'Victoria Ziemann',
            description:
              'Quisquam voluptatibus quis architecto delectus et. Fugiat dolores esse libero.',
            orGroups: [],
          },
          {
            id: 'c2b1e76396a71f90eecfb8d6',
            name: 'Brittany Gutkowski',
            description:
              'Eius in esse minima ullam quae eligendi impedit voluptas voluptates. Accusamus possimus exercitationem quis dolor enim. Culpa quo explicabo. Sint minus molestiae repellat nisi officia blanditiis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f65e7fa1dfbbe8bf20ec5bc5',
        rules: [
          {
            id: '365f6f2d2fe5786d6ff96ba0',
            name: 'Alexander Nolan',
            description:
              'Sapiente porro sequi reprehenderit. Quis praesentium odio molestiae eligendi ipsum quis distinctio.',
            orGroups: [],
          },
          {
            id: '6cd54feaa7ccacc17fdb57bf',
            name: 'Mr. Willie Huel',
            description:
              'Nemo porro adipisci molestiae minus impedit accusantium laboriosam. Explicabo consectetur natus aspernatur quidem animi veritatis magnam at laudantium. Exercitationem enim facilis eveniet excepturi suscipit provident.',
            orGroups: [],
          },
          {
            id: '329cd19d7c8ae9b4f4ee6d90',
            name: 'Pam Walsh',
            description:
              'Possimus quibusdam rem minima. Unde doloribus voluptatibus eaque pariatur voluptate minima amet minima. Dolore fugit consequuntur.',
            orGroups: [],
          },
          {
            id: '83ecc7bf55332d858cb93fbc',
            name: 'Beverly Cremin',
            description:
              'Iste expedita quis nam. Nulla numquam iure eligendi aspernatur. Deserunt voluptatum veniam unde. Suscipit tenetur pariatur illum culpa mollitia tempora. Reprehenderit neque nemo optio quisquam.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'a70d9a9d1a5ecba067cb0afc',
        rules: [
          {
            id: 'dae3a98c9b5e06832d5bbb1b',
            name: 'Loretta Bosco',
            description:
              'Quasi laborum ut perspiciatis sapiente itaque corrupti laudantium cupiditate. Eum quia velit voluptas. Facilis sed excepturi ut eveniet. Nesciunt vel ea debitis reprehenderit.',
            orGroups: [],
          },
          {
            id: '61b0fcadcf2e5acaa2b76bd4',
            name: 'Trevor Price',
            description:
              'In rerum labore minus molestiae blanditiis fugit. Pariatur quam amet. Repellat delectus enim facilis voluptates eligendi nostrum. Quaerat molestias cum quo distinctio explicabo. Minima aut consequatur ut at earum. Quis ullam corporis consequatur alias pariatur sint nostrum praesentium.',
            orGroups: [],
          },
          {
            id: 'cafa06dc174f37ca9bbcea8e',
            name: 'Maggie Stehr V',
            description:
              'Reprehenderit quisquam accusamus ducimus cum sunt ipsam dolorum quod sapiente. Sed temporibus fuga eum inventore sit esse maiores labore. Eos fuga placeat ratione eveniet ipsa. Fuga omnis sit. Minima temporibus iure ab. Voluptas itaque nemo similique rerum aspernatur.',
            orGroups: [],
          },
          {
            id: 'a33c87dbc8a9cb764ddf842f',
            name: 'Meredith Terry',
            description:
              'Aliquam odit maiores a harum porro repudiandae nobis. Corrupti quas iste porro provident excepturi nam explicabo.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ffbda6a9bdadcaeefb86bede',
        rules: [
          {
            id: 'e42110cf2aa06c38cff40cd9',
            name: 'Miss Marguerite Bayer',
            description:
              'Maxime et eum. Blanditiis fuga earum natus fugit cumque beatae laborum voluptates dolores. Fuga soluta ut. Temporibus beatae cumque nulla. Quod sint tempora adipisci mollitia dignissimos aliquam itaque. Nostrum magnam facilis optio nesciunt.',
            orGroups: [],
          },
          {
            id: 'c9e55d707bcf68b4a307e4ce',
            name: 'Holly Prosacco',
            description:
              'In saepe cumque quaerat eum impedit fugiat. Animi pariatur vitae eligendi cupiditate doloribus earum. Error eaque dolores hic incidunt eum. Natus vitae earum quia vero assumenda nostrum.',
            orGroups: [],
          },
          {
            id: '6fd96afe4a57793deecabe4f',
            name: 'Mr. Harvey Ferry',
            description:
              'Itaque alias asperiores molestiae cum similique rem voluptate earum eum. Veritatis enim assumenda. Natus porro laudantium perspiciatis deserunt fugit cupiditate exercitationem. Commodi et eaque aliquam sunt nemo velit corrupti dolorum sint. Ex ipsum est rem dolore. Itaque consequuntur enim magni minus possimus cupiditate similique odio.',
            orGroups: [],
          },
          {
            id: '8c7e9dce0fabd5ba515dbba3',
            name: 'Dr. Dominick Huels',
            description:
              'Dolore beatae iusto quaerat laboriosam repudiandae velit omnis. Doloremque velit repudiandae cupiditate. Reprehenderit nesciunt velit aspernatur nam commodi. Aliquam delectus fugiat necessitatibus explicabo ratione dignissimos ex excepturi. Nulla sed voluptate.',
            orGroups: [],
          },
          {
            id: 'ac94f191d5d6f6544d58ddfd',
            name: 'Boyd Wiza',
            description:
              'Nisi ipsam voluptatibus voluptatum quas corrupti pariatur. Explicabo voluptate libero vitae. Consectetur molestias voluptatem fugiat provident voluptatum quod commodi occaecati vitae.',
            orGroups: [],
          },
          {
            id: 'c0f9bce670e63f555f1ebbcf',
            name: 'Rick Ratke',
            description:
              'Facilis sit cum perferendis amet doloremque repudiandae eum. Totam repellat qui eum nostrum asperiores.',
            orGroups: [],
          },
          {
            id: 'dabb92ecba371fba1c02b61e',
            name: 'Laurence Barrows',
            description:
              'Animi voluptates iure necessitatibus eaque laudantium molestias unde sed amet. Sequi eligendi similique libero velit officiis animi accusantium eligendi.',
            orGroups: [],
          },
          {
            id: '5b7429be9995c8dcb6e9e90e',
            name: 'Clifford Gislason',
            description:
              'Iure sunt repudiandae suscipit unde id consectetur ex non dolorem. Aspernatur assumenda enim voluptates exercitationem commodi cupiditate eius harum expedita. Deleniti quia ad. Aspernatur suscipit tempora. Eaque blanditiis natus libero cupiditate voluptatum fuga labore. Repellendus natus quibusdam aliquid ea minima.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f60f6bb263e8b7e930e29e4a',
        rules: [
          {
            id: 'd1aac908efd5dadbc5cdaaeb',
            name: 'Gustavo Mitchell',
            description:
              'Autem atque modi illum nisi corrupti quibusdam debitis. At voluptates rem voluptas maxime amet delectus velit. Dicta fugiat animi soluta architecto maiores. Quidem consequuntur beatae quo cupiditate minus. Autem magnam nobis reiciendis pariatur recusandae officia numquam. Voluptatibus temporibus voluptate.',
            orGroups: [],
          },
          {
            id: 'c3f6ec9f3a084ef0b5fafb96',
            name: 'Ms. Jerald Reilly',
            description:
              'Explicabo odit minima laborum cupiditate. Sunt fugiat optio. Molestias nihil vel animi tempore.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'f60f6bb263e8b7e930e29e4a',
      rules: [
        {
          id: 'd1aac908efd5dadbc5cdaaeb',
          name: 'Gustavo Mitchell',
          description:
            'Autem atque modi illum nisi corrupti quibusdam debitis. At voluptates rem voluptas maxime amet delectus velit. Dicta fugiat animi soluta architecto maiores. Quidem consequuntur beatae quo cupiditate minus. Autem magnam nobis reiciendis pariatur recusandae officia numquam. Voluptatibus temporibus voluptate.',
          orGroups: [],
        },
        {
          id: 'c3f6ec9f3a084ef0b5fafb96',
          name: 'Ms. Jerald Reilly',
          description:
            'Explicabo odit minima laborum cupiditate. Sunt fugiat optio. Molestias nihil vel animi tempore.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'db63e002b1386b3e2aeee62b',
    name: 'Traci Veum',
    description:
      'Facilis voluptas praesentium animi amet assumenda dolores. Quis saepe quas minima officiis. Praesentium maiores modi. Quisquam quasi debitis sequi numquam aliquam laudantium aliquid nesciunt.',
    mainTable: 'Altenwerth',
    versions: [
      {
        id: 'aeef7ebe6dd7dfcef96dddd8',
        rules: [
          {
            id: 'f53d5ac058daf3360aae4b8f',
            name: 'Mae Bruen',
            description:
              'Fugit provident ex sapiente mollitia. Reiciendis eos quo voluptas magnam sit consequuntur soluta rerum. Molestias voluptas sed eaque ipsa ut modi ut porro. Blanditiis exercitationem eligendi unde itaque sequi. Repellat vel modi.',
            orGroups: [],
          },
          {
            id: '4f3cf4bbcfcfbdc67d2f48ca',
            name: 'Eric Weimann',
            description:
              'Aliquid esse aperiam nesciunt voluptas rerum optio quia ratione. Voluptates suscipit repellat tenetur quos animi tempore culpa architecto ullam.',
            orGroups: [],
          },
          {
            id: '38fcd028e4dcbfafdad1bfcb',
            name: 'Vicki Crist',
            description:
              'Possimus dolore quasi ea laudantium eum molestias quod velit velit. Aperiam necessitatibus nemo optio. Nesciunt voluptatum autem vel inventore officiis. Amet voluptate beatae voluptate. Eos consequatur itaque velit ipsam reprehenderit.',
            orGroups: [],
          },
          {
            id: '0f6d1b5bf4fca4adb8d78dbf',
            name: 'Mr. Bessie Auer',
            description:
              'Maxime quibusdam vitae nihil omnis optio. Ea quisquam non assumenda. Illo repudiandae mollitia incidunt eligendi alias molestiae accusantium.',
            orGroups: [],
          },
          {
            id: 'beed438adadeaa50eddbc8d8',
            name: 'Barry Cruickshank',
            description:
              'Soluta quam tenetur rem ratione porro deserunt magnam. Culpa eligendi possimus laborum amet. Occaecati dolorem quibusdam repellat magnam earum voluptatibus nesciunt. Mollitia error ducimus perferendis eligendi delectus dignissimos odio laudantium. Ab qui ducimus consectetur nesciunt sint. Enim nisi voluptates.',
            orGroups: [],
          },
          {
            id: '83ced8d71e31fba0b06c0b50',
            name: 'Glenn Kiehn',
            description:
              'Eum quia recusandae nisi dolore quasi. Voluptate numquam nam totam nihil. Impedit accusantium quis ex deserunt harum. Officiis esse consequatur dolores pariatur. Consectetur necessitatibus tempore vero est ducimus inventore inventore rem.',
            orGroups: [],
          },
          {
            id: '91abafad15e3b5f48fd7de16',
            name: 'Dr. Lorenzo McGlynn',
            description:
              'Earum eos hic ad ab fugit magnam sed ducimus. Libero nam quidem blanditiis eaque rem reiciendis et. Molestias sint veniam veniam numquam.',
            orGroups: [],
          },
          {
            id: '2ac8f0becb7bede8e79ee4ec',
            name: 'Olivia Heaney',
            description:
              'Sequi rerum fugit delectus sunt in architecto ipsa. Molestiae eum architecto sint culpa. Officiis libero laboriosam possimus repellat quae maxime molestiae rem. Sunt possimus illo. Fuga tempore itaque maiores odit.',
            orGroups: [],
          },
          {
            id: '2fcc86f8c2ca5e17b448e9b6',
            name: 'Mr. Christie Kuhlman',
            description:
              'Provident eligendi officia. Inventore et debitis. Accusamus animi dolorem nostrum ipsa reprehenderit. Sed repellendus quia nesciunt atque.',
            orGroups: [],
          },
        ],
      },
      {
        id: '9e764dcc28d16fca1d7ed70c',
        rules: [
          {
            id: '1575a61f6e3cfbbb6f73cb54',
            name: 'Delbert Connelly',
            description:
              'Distinctio ea quis dicta. Voluptates modi error fuga doloremque. Debitis ratione itaque dolor alias quo.',
            orGroups: [],
          },
          {
            id: '637baf7fc6e5aed3fbfa7208',
            name: 'Howard Turcotte',
            description:
              'Illum alias harum. Ipsa culpa saepe ab molestiae amet quisquam sunt recusandae. Quos itaque dignissimos facere aperiam adipisci quod ab dolore quasi.',
            orGroups: [],
          },
          {
            id: 'e9edad66ebabbb894525a451',
            name: 'Patrick Lockman',
            description:
              'Ad consectetur tenetur aliquid ipsa laudantium fuga exercitationem asperiores. Quas voluptas hic magni. Veritatis neque quam. Voluptate consequuntur dicta fuga. Deserunt consectetur voluptatibus ad rem iure.',
            orGroups: [],
          },
          {
            id: '4d6b2fa8ac8a4655eed9e884',
            name: 'Ricardo Tillman',
            description:
              'Unde unde cupiditate facere beatae iusto perferendis repudiandae iure quam. Tenetur quisquam cum repellat minus magnam dicta quaerat sit assumenda. Tempore libero sequi eveniet molestiae doloremque molestiae ipsa tempore.',
            orGroups: [],
          },
          {
            id: 'a0bf1fe3dbdce1d6632fb172',
            name: 'Dixie Emmerich',
            description:
              'Nesciunt necessitatibus facilis mollitia eius. Beatae ex ut aliquam eum cum voluptatibus asperiores iusto aliquid. Excepturi excepturi voluptatibus excepturi repellendus libero similique officiis repellendus labore. Autem tempora dolores quia quod. Ut sed odit accusantium illum dolores.',
            orGroups: [],
          },
          {
            id: '3fa5af82eda745b8dac306af',
            name: 'Douglas Dach',
            description:
              'Possimus libero iste culpa ipsa ipsam reprehenderit animi. Quia non laborum reiciendis occaecati vitae dolores numquam modi occaecati. Deserunt nisi animi non numquam rerum fugit quam atque. Consequuntur praesentium qui velit quam voluptatem minima iure. Perferendis ipsam magnam veniam autem voluptates commodi in.',
            orGroups: [],
          },
          {
            id: '2dcf72f3fc36f04ef43656f7',
            name: 'Dr. Marcus Luettgen',
            description:
              'Animi corrupti laudantium. Omnis voluptatum fugit quibusdam pariatur tempore perferendis quidem hic. Minus corporis aliquam minus rem praesentium accusamus itaque. Libero incidunt commodi assumenda quia suscipit ab placeat.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bcccf003082dbc2dcd0becdf',
        rules: [
          {
            id: '7540ddb7e93b9f6caa7dbf6e',
            name: 'Don Jast',
            description:
              'Iste corrupti mollitia fugit libero quisquam. Architecto omnis sunt accusamus. Praesentium ullam ipsam recusandae accusantium et facilis illum. Est repellendus qui itaque in eveniet sed consequatur fugiat. Magni esse iste quos.',
            orGroups: [],
          },
          {
            id: 'fe3dbffaa6baa0f7a60b1272',
            name: 'Dr. Gabriel Kirlin',
            description:
              'Necessitatibus aliquam accusamus nulla ad facilis nobis molestias illo. Fugit voluptates ducimus modi vero vitae tempora. Itaque laudantium vero numquam libero expedita necessitatibus. Odio eius fugiat alias omnis tempore voluptatum.',
            orGroups: [],
          },
          {
            id: 'bd88107dbdcfc1a36fae4a78',
            name: 'Angie Krajcik',
            description:
              'Recusandae eum voluptatem dolor. Nostrum in sit. Nobis iusto neque temporibus.',
            orGroups: [],
          },
          {
            id: 'dcbaec7d3fcd7b5ab89ef8bf',
            name: 'Beatrice Koss',
            description: 'A amet labore nisi temporibus. Labore tempore ipsa.',
            orGroups: [],
          },
          {
            id: 'ddefdcc7d7d56eb1e0ae48f2',
            name: 'Albert Ernser',
            description:
              'Mollitia corporis dolor modi quaerat doloribus corporis minima blanditiis impedit. Occaecati sunt repudiandae cupiditate. Odit vel quidem quisquam reiciendis eligendi nihil.',
            orGroups: [],
          },
          {
            id: 'acc81fa17b3bfffeee1bece7',
            name: 'Sherman Ziemann',
            description:
              'Consequuntur possimus animi voluptatibus cumque. Iusto culpa repellat voluptatum repellendus. Temporibus repudiandae natus tempore accusantium fuga dolorem. Perspiciatis neque beatae officiis fuga aspernatur veritatis. Laborum quibusdam dolores ipsa temporibus exercitationem dolore minus.',
            orGroups: [],
          },
          {
            id: 'cad4cdfedea9ef8e61aaa303',
            name: 'Angelo Kunde V',
            description:
              'Quisquam repellendus architecto minima labore doloremque asperiores architecto ullam. Architecto officia aspernatur quidem. Odit omnis neque vitae eum ipsa debitis placeat. Dolores atque ipsum.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'bcccf003082dbc2dcd0becdf',
      rules: [
        {
          id: '7540ddb7e93b9f6caa7dbf6e',
          name: 'Don Jast',
          description:
            'Iste corrupti mollitia fugit libero quisquam. Architecto omnis sunt accusamus. Praesentium ullam ipsam recusandae accusantium et facilis illum. Est repellendus qui itaque in eveniet sed consequatur fugiat. Magni esse iste quos.',
          orGroups: [],
        },
        {
          id: 'fe3dbffaa6baa0f7a60b1272',
          name: 'Dr. Gabriel Kirlin',
          description:
            'Necessitatibus aliquam accusamus nulla ad facilis nobis molestias illo. Fugit voluptates ducimus modi vero vitae tempora. Itaque laudantium vero numquam libero expedita necessitatibus. Odio eius fugiat alias omnis tempore voluptatum.',
          orGroups: [],
        },
        {
          id: 'bd88107dbdcfc1a36fae4a78',
          name: 'Angie Krajcik',
          description:
            'Recusandae eum voluptatem dolor. Nostrum in sit. Nobis iusto neque temporibus.',
          orGroups: [],
        },
        {
          id: 'dcbaec7d3fcd7b5ab89ef8bf',
          name: 'Beatrice Koss',
          description: 'A amet labore nisi temporibus. Labore tempore ipsa.',
          orGroups: [],
        },
        {
          id: 'ddefdcc7d7d56eb1e0ae48f2',
          name: 'Albert Ernser',
          description:
            'Mollitia corporis dolor modi quaerat doloribus corporis minima blanditiis impedit. Occaecati sunt repudiandae cupiditate. Odit vel quidem quisquam reiciendis eligendi nihil.',
          orGroups: [],
        },
        {
          id: 'acc81fa17b3bfffeee1bece7',
          name: 'Sherman Ziemann',
          description:
            'Consequuntur possimus animi voluptatibus cumque. Iusto culpa repellat voluptatum repellendus. Temporibus repudiandae natus tempore accusantium fuga dolorem. Perspiciatis neque beatae officiis fuga aspernatur veritatis. Laborum quibusdam dolores ipsa temporibus exercitationem dolore minus.',
          orGroups: [],
        },
        {
          id: 'cad4cdfedea9ef8e61aaa303',
          name: 'Angelo Kunde V',
          description:
            'Quisquam repellendus architecto minima labore doloremque asperiores architecto ullam. Architecto officia aspernatur quidem. Odit omnis neque vitae eum ipsa debitis placeat. Dolores atque ipsum.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'c5ebf765a16f0cbcc0e4f9f9',
    name: 'Jaime Ruecker',
    description:
      'Quibusdam voluptatem quia sapiente repudiandae similique quibusdam inventore. Recusandae quam minus corporis beatae atque laudantium.',
    mainTable: 'Russel',
    versions: [
      {
        id: '1b2c2bda3048a30bbdbc768b',
        rules: [
          {
            id: '0dfb97a09f9e00591fe609ba',
            name: 'Julius Graham',
            description:
              'Enim nesciunt blanditiis sapiente occaecati vel laudantium molestias. Consectetur tempore laudantium voluptatum molestiae. Blanditiis aspernatur debitis impedit eaque facere. Ducimus dolorum fugit.',
            orGroups: [],
          },
          {
            id: '239dbc6bed99e812448e1aa9',
            name: 'Essie Casper',
            description:
              'Totam illo nobis numquam sit modi. Magnam nam eos exercitationem temporibus nobis ducimus non doloremque omnis. At fugiat esse. Aliquam voluptates earum natus.',
            orGroups: [],
          },
          {
            id: 'f310d5193e7ecaad9be1d4ab',
            name: 'Jenna Mohr',
            description:
              'Voluptates animi iusto iusto. Voluptatibus impedit occaecati beatae laudantium consequuntur harum laudantium quasi necessitatibus. At consectetur consectetur magni.',
            orGroups: [],
          },
          {
            id: '3feedc4602cf8da6b25c8cd5',
            name: 'Erma Gibson',
            description:
              'Possimus laudantium excepturi esse molestias possimus recusandae. Ipsa vitae cum. Ea nihil non quasi voluptatum. Nobis numquam placeat iure fugiat eius ex non.',
            orGroups: [],
          },
          {
            id: 'e1f86dbaa6c55387cd9a9489',
            name: 'Dana Kuvalis',
            description:
              'Cupiditate itaque soluta reiciendis magni nam hic temporibus. Commodi expedita aut eum. Minus at eum. Vel eligendi doloribus sunt tempore. Voluptatibus accusantium reiciendis. Quasi placeat reiciendis commodi dicta nobis.',
            orGroups: [],
          },
          {
            id: 'dc373fe22fccea4aed14b54e',
            name: 'Elmer Cassin',
            description:
              'Debitis expedita eius mollitia. Libero voluptas magnam deserunt natus tempore eaque adipisci. Doloribus porro provident dolorum rem accusamus provident natus neque.',
            orGroups: [],
          },
          {
            id: '31ceb80b3e64e0e1429bfaaa',
            name: 'Heidi Hahn',
            description:
              'Rem natus sapiente. Esse rerum quam aspernatur sit culpa repudiandae. Labore non animi nam quas sequi itaque nesciunt ipsam.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f3c6c04dd2f3cd5be17ad18c',
        rules: [
          {
            id: '9acd06f3caefbfc4b8a8c989',
            name: 'Duane Mayert',
            description:
              'Aliquid quam nemo. Nam fuga repudiandae mollitia reiciendis eligendi aperiam ducimus. Dolorem exercitationem eos aliquid est ad temporibus.',
            orGroups: [],
          },
          {
            id: 'e01e1c27b01d8bb05cbaad0f',
            name: 'Greg Prohaska',
            description:
              'Amet voluptas quidem consequatur illum nobis numquam alias cumque quos. Ullam iure hic ex delectus ipsa possimus illum. Voluptatem accusamus incidunt aliquid cum molestiae temporibus. Tenetur enim saepe voluptate repudiandae.',
            orGroups: [],
          },
          {
            id: 'd572ea2ddeeadceafcdcb3ad',
            name: 'Johnnie Wehner',
            description:
              'Ipsa quis eveniet molestias vel exercitationem quas magnam. Ipsum aliquam aspernatur cupiditate nesciunt iste adipisci.',
            orGroups: [],
          },
          {
            id: 'b5beba1fe6746c13d71bfc4c',
            name: 'Rachael Hodkiewicz',
            description:
              'Doloribus neque corporis. Asperiores officiis ea. Molestiae eligendi totam at explicabo. Vitae ab qui nesciunt mollitia voluptatum sit porro magnam occaecati. Iure debitis odio sint officiis maiores earum veritatis ab. Vel facilis consequuntur fugit quasi doloribus.',
            orGroups: [],
          },
          {
            id: 'aff7224c4fdbeace9fff0f0f',
            name: 'Josh Beatty',
            description:
              'Cumque dicta doloribus eius rem culpa fuga explicabo asperiores. Officiis odit rem. Inventore occaecati ipsam nisi harum voluptates quae dicta natus. Similique provident earum blanditiis sit assumenda sunt necessitatibus. Sunt ratione ad soluta veniam a.',
            orGroups: [],
          },
          {
            id: '6da1fe9af178edebba95c178',
            name: 'Ms. Chris Mayert',
            description:
              'Perspiciatis nobis harum labore dicta cupiditate deserunt quae. Mollitia illum repellendus ducimus culpa maxime eaque sunt aspernatur.',
            orGroups: [],
          },
          {
            id: '3bbcbd8affbd87daf8f45593',
            name: 'Richard Bauch',
            description:
              'Sed itaque impedit ratione delectus autem aspernatur dolor. Eveniet ducimus nemo.',
            orGroups: [],
          },
        ],
      },
      {
        id: '3358c7abdceeffb3d997ed7a',
        rules: [
          {
            id: 'eb0be54edeae5cff4814d53a',
            name: 'Deanna Fritsch',
            description:
              'Omnis aperiam neque nostrum repudiandae nobis. Eveniet laborum repellat numquam reprehenderit dolores vitae dignissimos distinctio.',
            orGroups: [],
          },
        ],
      },
      {
        id: '7a6934a1bf20bfc6e2a0cf5d',
        rules: [
          {
            id: 'b45c5fa12dbac31031aa4422',
            name: 'Owen Schoen',
            description:
              'Molestias unde nulla. Nobis maxime quam fuga incidunt dicta rem. Officia corporis maxime molestiae facilis dolore nobis. Fuga perspiciatis laborum dolore accusamus tempora facere reprehenderit incidunt omnis. Autem sequi cum quos saepe blanditiis.',
            orGroups: [],
          },
          {
            id: 'aa7ebded41ad1a8afb5f1cd9',
            name: 'Katie Mills',
            description:
              'Minima ut error pariatur quam pariatur eius accusamus vero. Natus veniam laudantium officiis laborum in unde esse excepturi vel.',
            orGroups: [],
          },
          {
            id: 'd60ae8fac44bfe787df348c9',
            name: 'Patrick Schiller',
            description:
              'Architecto soluta vitae nihil sequi tenetur deleniti provident possimus enim. Occaecati et dolor suscipit dolorum nulla. Ad itaque nisi sint consectetur. Exercitationem error alias eos molestiae facilis iste optio facilis natus. Vero eos ducimus quis perferendis.',
            orGroups: [],
          },
          {
            id: '6afa92bab57b884bbc3c887d',
            name: 'Elmer Anderson',
            description:
              'Tempora dicta ratione repellendus quidem occaecati facilis natus totam. Aspernatur a illo vero nemo officiis repudiandae vitae quisquam consequatur. Doloremque quisquam laboriosam asperiores consequuntur atque consequuntur ipsum aliquam. Fugit optio optio ullam.',
            orGroups: [],
          },
          {
            id: 'fdfb8e3c60d6ef5f057beaea',
            name: 'Susan Harber',
            description:
              'Optio qui ipsa dolorem doloribus. Explicabo porro nisi.',
            orGroups: [],
          },
          {
            id: 'b0f7aded59e7f90aa21b8603',
            name: 'Ms. Marshall Satterfield',
            description:
              'Sunt beatae nulla veritatis. Animi id sapiente voluptatibus vero. Ipsum dicta ab error doloremque. Corrupti officiis officia ex modi ratione fuga. Neque ducimus veritatis consequuntur officia inventore numquam dolores.',
            orGroups: [],
          },
          {
            id: 'cddcce4d5214a81be4dcc05f',
            name: 'Elbert Nolan',
            description:
              'Numquam quo atque dolorem beatae tenetur voluptate repellendus saepe quo. Vel inventore mollitia eaque tempore ipsum. Voluptate nesciunt autem dolorum optio sunt facilis doloremque. Minus quod dolore numquam natus provident minus.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'cd20c216aed8daabc7da2edd',
        rules: [
          {
            id: '70b42885fc8c0ab4cc108faa',
            name: 'Wilbur Bergnaum',
            description:
              'Sit nesciunt alias nam. Doloribus ad sunt voluptatum totam aperiam. Distinctio facilis quia quae consequuntur. Molestiae placeat corrupti adipisci veritatis ducimus cupiditate.',
            orGroups: [],
          },
          {
            id: '2f73fd4e323eb0f6045be591',
            name: 'Molly Gutkowski',
            description:
              'Sit itaque id blanditiis saepe temporibus natus possimus. Maxime nesciunt animi placeat neque quibusdam. Laborum dolorem eos alias modi. Voluptatem mollitia dolor tempore error laudantium quisquam deserunt neque atque.',
            orGroups: [],
          },
          {
            id: '6b82e4de730a4c371e166f7e',
            name: 'Yvette Lockman',
            description:
              'Quasi explicabo sequi illum a incidunt nobis consectetur quae. Doloribus odio odit laborum mollitia.',
            orGroups: [],
          },
          {
            id: '2ad60dab387d7e4f6a4566d9',
            name: 'Brad Grady',
            description:
              'Natus doloribus porro voluptatibus adipisci sed veritatis. Consequuntur voluptates harum placeat suscipit quidem asperiores ducimus itaque. Tempore iusto similique autem necessitatibus fuga.',
            orGroups: [],
          },
          {
            id: '036b0a577ce995aaf2f05fbc',
            name: 'Katie Bergnaum',
            description:
              'Non in tenetur. Voluptates consectetur officia autem veritatis. Eos labore asperiores placeat. Incidunt at fugit illum maiores nam. Veniam non corrupti ipsam expedita quas. Ullam dolores quas vitae nulla.',
            orGroups: [],
          },
          {
            id: 'a6ec1fc26847f8f235ffdb59',
            name: 'Yvonne Murazik',
            description:
              'Ut in quam corrupti enim tempore. Eveniet necessitatibus deserunt molestias sapiente quas magnam.',
            orGroups: [],
          },
          {
            id: '68b3c68dbedd88fb3d6b3bd9',
            name: 'Gerardo Weber II',
            description:
              'Reprehenderit possimus totam repudiandae dolorem rem. In rem dolore. Molestiae veniam doloribus eveniet rem quasi quibusdam enim error.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ac99bddaf0c3d9abbf328d73',
        rules: [
          {
            id: 'f8abcd6cafec1fb2337fe537',
            name: 'Maria Bernhard',
            description:
              'Quaerat quae vitae error. Maxime molestiae reprehenderit officiis ullam consequatur animi. Corrupti nesciunt iure minima eligendi.',
            orGroups: [],
          },
          {
            id: 'caaea1fa116d6db085cfeadc',
            name: 'Johnathan Kirlin',
            description:
              'Praesentium placeat itaque quaerat praesentium. Quasi non nostrum rem alias fugiat nihil consequatur. Distinctio iste consequatur repellendus at consequuntur sequi nulla deserunt sint. Voluptatibus a rerum. Odit facere dolorem.',
            orGroups: [],
          },
          {
            id: 'd39732449ad7e0b30e9fd3db',
            name: 'Willie Brown II',
            description:
              'Officiis hic recusandae deleniti. Architecto quas atque similique. Quidem molestiae eligendi saepe consequuntur temporibus unde numquam fuga voluptatem. Assumenda aliquid dolorum natus quos commodi repellat ab. Facere error earum aspernatur tempora recusandae exercitationem itaque explicabo libero.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'ac99bddaf0c3d9abbf328d73',
      rules: [
        {
          id: 'f8abcd6cafec1fb2337fe537',
          name: 'Maria Bernhard',
          description:
            'Quaerat quae vitae error. Maxime molestiae reprehenderit officiis ullam consequatur animi. Corrupti nesciunt iure minima eligendi.',
          orGroups: [],
        },
        {
          id: 'caaea1fa116d6db085cfeadc',
          name: 'Johnathan Kirlin',
          description:
            'Praesentium placeat itaque quaerat praesentium. Quasi non nostrum rem alias fugiat nihil consequatur. Distinctio iste consequatur repellendus at consequuntur sequi nulla deserunt sint. Voluptatibus a rerum. Odit facere dolorem.',
          orGroups: [],
        },
        {
          id: 'd39732449ad7e0b30e9fd3db',
          name: 'Willie Brown II',
          description:
            'Officiis hic recusandae deleniti. Architecto quas atque similique. Quidem molestiae eligendi saepe consequuntur temporibus unde numquam fuga voluptatem. Assumenda aliquid dolorum natus quos commodi repellat ab. Facere error earum aspernatur tempora recusandae exercitationem itaque explicabo libero.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'd9cabcbddb71a5fccd5beb08',
    name: 'Carmen White',
    description:
      'Minus omnis aperiam provident. Quasi quod veritatis velit aliquid quo modi molestias eligendi.',
    mainTable: 'Wilkinson',
    versions: [
      {
        id: 'dca506da3364c9e1ee9b88df',
        rules: [
          {
            id: 'ef3be44bbafb4bed6aeda1ff',
            name: 'Jacquelyn Reinger',
            description:
              'Maiores odit eaque. Qui minus incidunt magnam vel atque debitis. Ullam similique nemo dolore. Quisquam nostrum distinctio. Fugit at minima quas omnis. Libero error culpa provident veritatis fugiat quod incidunt repellendus alias.',
            orGroups: [],
          },
          {
            id: '1c34733c7fbc6cf68bd1a9ca',
            name: 'Kay Marks',
            description:
              'Reiciendis cupiditate consequatur adipisci fugit sapiente. Minima reiciendis minus fugit perferendis nemo quibusdam sed commodi.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'e32490f0abc2bca6e3bbd393',
        rules: [
          {
            id: 'be06a2afbbf3a8ab8afc91dd',
            name: 'Mary Muller',
            description:
              'Pariatur totam voluptate quod. Minus architecto quis assumenda nesciunt.',
            orGroups: [],
          },
          {
            id: '7d63b565cadf9dc510ef89cc',
            name: 'Bridget Parisian',
            description:
              'Occaecati eligendi quas excepturi assumenda a corporis libero esse. Ipsum et sint esse tempore. Fugit molestiae veniam labore numquam similique ullam. Iste suscipit ipsam tempora eveniet beatae at suscipit explicabo. Perspiciatis praesentium praesentium sapiente inventore. Fuga odit hic officiis.',
            orGroups: [],
          },
          {
            id: 'e2ecdf00cb0eeb0a6cc86fb2',
            name: 'Kathy Waters',
            description:
              'Ea reiciendis veniam est at explicabo laboriosam magnam quaerat quis. Dolore expedita aperiam minima ex magnam nisi beatae. Commodi modi modi pariatur similique vero nostrum. Impedit tenetur consequuntur occaecati fugiat sed harum. Eius dicta magni voluptates deserunt culpa soluta dolores.',
            orGroups: [],
          },
          {
            id: 'abcaa8c0481cc0dc3ca5e4a5',
            name: 'Teresa Littel DVM',
            description:
              'Repellat odio quod dolores. Earum cum doloremque soluta eos esse dolores laboriosam. Quas unde optio dolorum soluta error. Perspiciatis eligendi optio quidem sequi dignissimos.',
            orGroups: [],
          },
          {
            id: '8cfdeaa077df8ea6e9dedda1',
            name: 'Lloyd Haley',
            description:
              'Maiores nesciunt animi eos cupiditate quis. Doloremque praesentium quasi.',
            orGroups: [],
          },
          {
            id: '447cd6bcfa9ecb5751bb82d4',
            name: 'Juana Vandervort',
            description:
              'Eligendi eos omnis tempora dolorem fugit. Maxime nihil officia cupiditate architecto possimus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '5c0881c04428bea2803db745',
        rules: [
          {
            id: 'eef787aa12cdfe970bcf2bdd',
            name: 'Glenda Paucek',
            description:
              'Aliquam sit ea rem illo quis dolor maiores. Aut ipsam necessitatibus dignissimos natus. Ad nulla maiores culpa error. A fugiat sapiente. Voluptatibus explicabo minus officia quo debitis.',
            orGroups: [],
          },
          {
            id: '71d2edb1dccd9bdd685c5dec',
            name: 'Elsie Gibson',
            description:
              'Cum laudantium officiis nobis modi expedita rem explicabo. Deleniti voluptatem accusamus excepturi sunt natus consequatur. Modi similique quam eligendi deserunt iure est dolor tempora aliquid. Ratione provident quos voluptatum veritatis et voluptatem quae in. Impedit saepe dolore ab laudantium. Beatae tempore quisquam deserunt.',
            orGroups: [],
          },
          {
            id: '80a1dd0660cf6ac068c598b8',
            name: 'Ms. Winifred Glover',
            description:
              'Architecto et at eos quae quibusdam necessitatibus inventore. Et consectetur totam officia architecto ipsum sapiente aut amet error. Tempore corrupti et minima cupiditate quisquam. Nam adipisci amet architecto eligendi eos facilis. Dolorum voluptas repellendus praesentium. Atque tempore fuga iste asperiores voluptatem voluptatem.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '5c0881c04428bea2803db745',
      rules: [
        {
          id: 'eef787aa12cdfe970bcf2bdd',
          name: 'Glenda Paucek',
          description:
            'Aliquam sit ea rem illo quis dolor maiores. Aut ipsam necessitatibus dignissimos natus. Ad nulla maiores culpa error. A fugiat sapiente. Voluptatibus explicabo minus officia quo debitis.',
          orGroups: [],
        },
        {
          id: '71d2edb1dccd9bdd685c5dec',
          name: 'Elsie Gibson',
          description:
            'Cum laudantium officiis nobis modi expedita rem explicabo. Deleniti voluptatem accusamus excepturi sunt natus consequatur. Modi similique quam eligendi deserunt iure est dolor tempora aliquid. Ratione provident quos voluptatum veritatis et voluptatem quae in. Impedit saepe dolore ab laudantium. Beatae tempore quisquam deserunt.',
          orGroups: [],
        },
        {
          id: '80a1dd0660cf6ac068c598b8',
          name: 'Ms. Winifred Glover',
          description:
            'Architecto et at eos quae quibusdam necessitatibus inventore. Et consectetur totam officia architecto ipsum sapiente aut amet error. Tempore corrupti et minima cupiditate quisquam. Nam adipisci amet architecto eligendi eos facilis. Dolorum voluptas repellendus praesentium. Atque tempore fuga iste asperiores voluptatem voluptatem.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '0fbab27b4f00e5b9e670aef2',
    name: 'Shelly Pfeffer',
    description:
      'Et similique atque. Voluptas nostrum nulla voluptates ipsa reiciendis magni. Omnis quasi quo quod. Labore adipisci ipsum animi delectus expedita facere molestias voluptatum voluptas. Laboriosam optio sint natus.',
    mainTable: 'Gorczany',
    versions: [
      {
        id: '6fa2e517a854e44cdbe161fd',
        rules: [
          {
            id: 'c12cdedbf18ead4ec7fea1d6',
            name: 'Lydia Kunze',
            description:
              'Non consequatur quidem adipisci beatae eligendi cupiditate iusto. Facere magni quae nemo atque pariatur cum quasi doloribus voluptatum. Consequatur aperiam sequi fugit officia eligendi nihil occaecati eaque. Veritatis corrupti possimus.',
            orGroups: [],
          },
          {
            id: 'efdecec9b7dbbceea917f8ad',
            name: 'Lula Kuhn',
            description:
              'Minus exercitationem ratione. Ducimus atque quisquam impedit ex. Praesentium eum fugiat excepturi unde.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8ee89dd61ec7e91a72c5cd69',
        rules: [
          {
            id: 'ca7baa0ba0ec08b92ea7f2e7',
            name: 'Johnathan Cremin',
            description:
              'Sit molestias fugiat. Debitis beatae quis. Nihil incidunt rem dolorem exercitationem dolorum optio cupiditate nesciunt soluta. Eligendi ipsum doloribus ipsum eveniet et. Inventore dicta est nobis amet.',
            orGroups: [],
          },
          {
            id: '9b902d2d86e1a89dbb74d2c1',
            name: 'Martha Koelpin',
            description:
              'Aut occaecati commodi ducimus eveniet animi. Recusandae quas rerum explicabo aperiam eos. Nesciunt reprehenderit omnis. Nobis quidem optio recusandae recusandae veniam.',
            orGroups: [],
          },
          {
            id: 'bf6c8befee009dce4dbfaba1',
            name: 'Jeannie West',
            description:
              'Atque deleniti quas cum. Minima tenetur vero. Ad harum corporis suscipit velit nam. Numquam qui recusandae et. Tempora fugit repellat consectetur repellat. Minus illo rem voluptas temporibus asperiores magnam id.',
            orGroups: [],
          },
          {
            id: 'ecf0af4d2c1d6cee55b297ae',
            name: 'Luis Weimann',
            description:
              'Ab accusantium quis. Ex dolorem quia aliquam eaque sed sequi aliquid. Numquam exercitationem totam modi a autem. Harum dolor illum placeat minima.',
            orGroups: [],
          },
          {
            id: 'ef654caabfe9a263abdf0a9d',
            name: 'Jamie Feest',
            description:
              'Autem officia velit accusantium. Unde laboriosam earum vitae soluta possimus placeat. Ea quisquam natus vel sunt. Autem officia nostrum et et minus esse odio esse. Eaque exercitationem itaque ex aperiam aliquam cum qui.',
            orGroups: [],
          },
          {
            id: '66dd7bcffbf90cab6ad3ed18',
            name: 'Brandi Marvin',
            description:
              'Doloribus consectetur excepturi delectus iure recusandae doloremque explicabo veritatis placeat. Iste eos placeat natus dicta error aspernatur ea at ea. Pariatur voluptatem harum aliquam repudiandae at nostrum. Dolorem fugiat officiis quasi veritatis nisi ad. Optio veniam nulla perferendis exercitationem excepturi repellendus. Officiis iure pariatur sit quibusdam pariatur impedit aperiam adipisci odio.',
            orGroups: [],
          },
          {
            id: '4e30febd77def4cadba562ea',
            name: 'Jeannette Blick',
            description:
              'Quod laboriosam cumque neque doloremque aut occaecati harum debitis. Natus voluptatibus corporis laboriosam neque vitae perspiciatis voluptates incidunt accusantium. Aspernatur velit molestias commodi maiores numquam molestiae deleniti illum. Fugit officia quibusdam accusantium soluta et laborum amet. Fugit ipsa repudiandae. Possimus rerum ducimus corporis non voluptatem asperiores non.',
            orGroups: [],
          },
          {
            id: '1b5460dca9138c15a9f11cf0',
            name: 'Mindy Brown',
            description:
              'Iste eos itaque voluptatem asperiores aliquid possimus. Placeat neque corrupti doloribus placeat delectus soluta dolore ipsa. Veniam minima laborum vitae cumque aperiam molestiae placeat. Provident nisi tenetur magni eligendi sit ad. Illo labore velit corporis dicta esse.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '8ee89dd61ec7e91a72c5cd69',
      rules: [
        {
          id: 'ca7baa0ba0ec08b92ea7f2e7',
          name: 'Johnathan Cremin',
          description:
            'Sit molestias fugiat. Debitis beatae quis. Nihil incidunt rem dolorem exercitationem dolorum optio cupiditate nesciunt soluta. Eligendi ipsum doloribus ipsum eveniet et. Inventore dicta est nobis amet.',
          orGroups: [],
        },
        {
          id: '9b902d2d86e1a89dbb74d2c1',
          name: 'Martha Koelpin',
          description:
            'Aut occaecati commodi ducimus eveniet animi. Recusandae quas rerum explicabo aperiam eos. Nesciunt reprehenderit omnis. Nobis quidem optio recusandae recusandae veniam.',
          orGroups: [],
        },
        {
          id: 'bf6c8befee009dce4dbfaba1',
          name: 'Jeannie West',
          description:
            'Atque deleniti quas cum. Minima tenetur vero. Ad harum corporis suscipit velit nam. Numquam qui recusandae et. Tempora fugit repellat consectetur repellat. Minus illo rem voluptas temporibus asperiores magnam id.',
          orGroups: [],
        },
        {
          id: 'ecf0af4d2c1d6cee55b297ae',
          name: 'Luis Weimann',
          description:
            'Ab accusantium quis. Ex dolorem quia aliquam eaque sed sequi aliquid. Numquam exercitationem totam modi a autem. Harum dolor illum placeat minima.',
          orGroups: [],
        },
        {
          id: 'ef654caabfe9a263abdf0a9d',
          name: 'Jamie Feest',
          description:
            'Autem officia velit accusantium. Unde laboriosam earum vitae soluta possimus placeat. Ea quisquam natus vel sunt. Autem officia nostrum et et minus esse odio esse. Eaque exercitationem itaque ex aperiam aliquam cum qui.',
          orGroups: [],
        },
        {
          id: '66dd7bcffbf90cab6ad3ed18',
          name: 'Brandi Marvin',
          description:
            'Doloribus consectetur excepturi delectus iure recusandae doloremque explicabo veritatis placeat. Iste eos placeat natus dicta error aspernatur ea at ea. Pariatur voluptatem harum aliquam repudiandae at nostrum. Dolorem fugiat officiis quasi veritatis nisi ad. Optio veniam nulla perferendis exercitationem excepturi repellendus. Officiis iure pariatur sit quibusdam pariatur impedit aperiam adipisci odio.',
          orGroups: [],
        },
        {
          id: '4e30febd77def4cadba562ea',
          name: 'Jeannette Blick',
          description:
            'Quod laboriosam cumque neque doloremque aut occaecati harum debitis. Natus voluptatibus corporis laboriosam neque vitae perspiciatis voluptates incidunt accusantium. Aspernatur velit molestias commodi maiores numquam molestiae deleniti illum. Fugit officia quibusdam accusantium soluta et laborum amet. Fugit ipsa repudiandae. Possimus rerum ducimus corporis non voluptatem asperiores non.',
          orGroups: [],
        },
        {
          id: '1b5460dca9138c15a9f11cf0',
          name: 'Mindy Brown',
          description:
            'Iste eos itaque voluptatem asperiores aliquid possimus. Placeat neque corrupti doloribus placeat delectus soluta dolore ipsa. Veniam minima laborum vitae cumque aperiam molestiae placeat. Provident nisi tenetur magni eligendi sit ad. Illo labore velit corporis dicta esse.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '4e1d05a4f3ea7b6cfde58a87',
    name: 'Allan Crooks',
    description:
      'Sed et impedit nulla est explicabo. Illum facilis sapiente dignissimos repudiandae neque ad laudantium maxime illo. Iste nesciunt sed cumque vel temporibus eveniet at harum. Ut quidem consequuntur. Dolorem iusto molestias culpa consectetur voluptatem.',
    mainTable: 'Kozey',
    versions: [
      {
        id: 'a35d59c945ff415a089e4aa8',
        rules: [
          {
            id: 'dceac0989dffdfefbcb7dbea',
            name: 'Eunice Stracke',
            description:
              'Doloremque in voluptas minima voluptas voluptatem maxime. Explicabo quo labore voluptatem excepturi. Molestiae nihil excepturi perspiciatis. Vitae tenetur voluptatum voluptatem nihil blanditiis adipisci ipsam iure. Ipsum minima odio maxime assumenda.',
            orGroups: [],
          },
          {
            id: 'e2eececdffcfe26f43dbaced',
            name: 'Maryann Brekke',
            description:
              'Doloribus quidem ipsam aliquid accusantium inventore error esse exercitationem ad. Illo itaque aperiam sequi officiis. Mollitia possimus dolorum fugit in id numquam dignissimos. Labore accusamus aperiam laborum omnis molestiae.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'a35d59c945ff415a089e4aa8',
      rules: [
        {
          id: 'dceac0989dffdfefbcb7dbea',
          name: 'Eunice Stracke',
          description:
            'Doloremque in voluptas minima voluptas voluptatem maxime. Explicabo quo labore voluptatem excepturi. Molestiae nihil excepturi perspiciatis. Vitae tenetur voluptatum voluptatem nihil blanditiis adipisci ipsam iure. Ipsum minima odio maxime assumenda.',
          orGroups: [],
        },
        {
          id: 'e2eececdffcfe26f43dbaced',
          name: 'Maryann Brekke',
          description:
            'Doloribus quidem ipsam aliquid accusantium inventore error esse exercitationem ad. Illo itaque aperiam sequi officiis. Mollitia possimus dolorum fugit in id numquam dignissimos. Labore accusamus aperiam laborum omnis molestiae.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'f259ab77b57fcc8fb3e366b5',
    name: 'Terry Wunsch',
    description:
      'Ipsam est similique recusandae inventore adipisci incidunt. Libero expedita pariatur iusto est ratione rerum in asperiores omnis. Illo perspiciatis et. Quam harum beatae aliquam laborum autem dicta. Illo tenetur possimus vel minima dolores laborum error laborum.',
    mainTable: 'Conroy',
    versions: [
      {
        id: '031d8b5aa634305a35a56529',
        rules: [
          {
            id: 'ad98e07bfff1e9aeea9afb08',
            name: 'Darnell Blick',
            description:
              'Eum iusto consequatur tempore praesentium laudantium. Quibusdam eaque iste delectus ducimus labore nisi expedita animi possimus. Officiis consectetur dolorem blanditiis pariatur non sapiente aliquam soluta fuga.',
            orGroups: [],
          },
          {
            id: 'cb804111ceecfe578aacbfa5',
            name: 'Gustavo Oberbrunner Jr.',
            description:
              'Quas velit ipsam numquam deleniti nostrum. Nisi repellendus provident non aliquid deleniti tenetur non voluptatem veritatis. Ducimus excepturi ut magni voluptas voluptatibus eligendi. Mollitia dignissimos incidunt quaerat.',
            orGroups: [],
          },
          {
            id: '10464b53f1d3b59eafda340e',
            name: 'Francis Mante MD',
            description:
              'Rerum fugit et unde a vel quia alias. Non odio neque optio et. Cupiditate vero omnis amet tenetur iste. Autem maiores sint incidunt atque sunt atque qui. Excepturi explicabo dolorem fuga inventore. Ratione veritatis debitis error totam.',
            orGroups: [],
          },
          {
            id: '4aec61cb72fd9be52f118dd5',
            name: 'Elsa Muller',
            description:
              'Quisquam facere sed debitis. Repellendus molestiae rem fugit quos aliquam temporibus sint ab.',
            orGroups: [],
          },
          {
            id: '2af10f8dcb96fcf1a36bc7e2',
            name: 'Roland Schimmel',
            description:
              'Dolores dolorem reiciendis voluptatem consequatur soluta doloremque. Neque labore cumque modi aperiam facilis error quisquam esse ratione. Ut corrupti harum adipisci.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'e858d30c5743a6aeecb35c86',
        rules: [
          {
            id: 'de97ef0c1f099afd7f1298f7',
            name: 'Paulette Keebler V',
            description:
              'Dicta incidunt voluptates magnam sint nulla culpa. Dolorum ut sequi quas blanditiis aut est at autem est.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'e858d30c5743a6aeecb35c86',
      rules: [
        {
          id: 'de97ef0c1f099afd7f1298f7',
          name: 'Paulette Keebler V',
          description:
            'Dicta incidunt voluptates magnam sint nulla culpa. Dolorum ut sequi quas blanditiis aut est at autem est.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'e2fe71a1a8ce955bbd6df1f4',
    name: 'Brian Champlin',
    description:
      'Explicabo labore ratione atque. Dolore adipisci incidunt nemo saepe nesciunt quia. Dolores minus debitis cupiditate necessitatibus esse. Ratione velit quod blanditiis eaque occaecati. Cumque ut quam labore fugit aspernatur.',
    mainTable: 'Auer',
    versions: [
      {
        id: 'd177ef61db85a792ccc7e5d2',
        rules: [
          {
            id: '7e3fb25acbf101eca249ac5e',
            name: 'Homer Runolfsdottir',
            description:
              'Itaque sequi doloremque sed enim fugit repellat. Enim libero adipisci repellendus laborum fugiat cumque quam animi. Facere nulla corrupti nobis dicta eos laborum minus. Tempore dolorem velit dolorem nemo quibusdam libero animi praesentium neque. Expedita assumenda explicabo natus autem porro minima sunt. Esse eligendi blanditiis est ullam eos nisi.',
            orGroups: [],
          },
          {
            id: '3aeeee0edf79adb8affcabe6',
            name: 'Amanda Erdman',
            description:
              'Saepe eum quos. Asperiores et praesentium eveniet placeat.',
            orGroups: [],
          },
          {
            id: 'c79e2ec4c7611ad388ad0ec3',
            name: 'Jean Bergstrom',
            description:
              'Impedit voluptatibus porro iste. Amet quam harum quidem accusantium harum.',
            orGroups: [],
          },
          {
            id: '7674dfc5d7d01e163edbd81d',
            name: 'Jeannie Schaden III',
            description:
              'Suscipit molestiae nesciunt natus nemo. Error magni cumque. Ipsum neque praesentium atque distinctio commodi. Adipisci aut quo odit eum.',
            orGroups: [],
          },
          {
            id: '0ec6dcc5ace9ffdb0ac34a1b',
            name: 'Rogelio Schaden',
            description:
              'Nam consequuntur atque atque vitae deserunt quas maxime. Dolorum inventore temporibus error facere eligendi alias consequatur.',
            orGroups: [],
          },
          {
            id: '4db4feeeef9be27dc05c9c4d',
            name: 'Roberta Hansen',
            description:
              'Rem quisquam quos assumenda officiis molestiae soluta dolorum quaerat omnis. Iusto consequuntur vitae quibusdam non unde assumenda.',
            orGroups: [],
          },
          {
            id: '8402dd4afadfdf5bc1da61ec',
            name: 'Moses Aufderhar',
            description:
              'Distinctio modi porro similique dignissimos quis consequuntur incidunt rerum. Ullam consequatur nobis odit dignissimos illum voluptatem debitis. Doloribus praesentium iusto debitis ut quia assumenda ab. Veniam minima ullam suscipit modi iure dicta laboriosam eius nihil. Nisi sit exercitationem id quas amet. Libero commodi quas fugit inventore ad hic velit cupiditate impedit.',
            orGroups: [],
          },
          {
            id: 'bcfb9abd3adfb6eeccb0fb69',
            name: 'Pete Harris',
            description:
              'Exercitationem neque sint reprehenderit excepturi ipsa. Natus incidunt voluptate ratione dignissimos itaque iure rerum laboriosam perspiciatis. Nam recusandae praesentium. Deleniti maiores eum. Nobis perspiciatis veniam nesciunt officia aut blanditiis magnam facere.',
            orGroups: [],
          },
          {
            id: '36a1727764bbabd1a2ac82d9',
            name: 'Tracy Hodkiewicz',
            description:
              'Ullam commodi nostrum ad ullam ex repellendus at laborum dignissimos. Eveniet similique perspiciatis quasi laboriosam illum id delectus amet. Esse animi ex. Iure eaque a porro dignissimos doloremque. Aliquam exercitationem maxime nobis voluptatum laborum distinctio placeat expedita neque. A dolorum maxime animi provident.',
            orGroups: [],
          },
        ],
      },
      {
        id: '9db3d9de86dbfde88310aee2',
        rules: [
          {
            id: 'ca3931bace2cafda49b8a54e',
            name: 'Clyde Koepp Sr.',
            description:
              'Quidem quae ullam nihil porro quidem. Reiciendis modi corrupti quo voluptas. Similique facere aliquam officia. Atque porro soluta nam ad molestias repellat quaerat ipsam.',
            orGroups: [],
          },
          {
            id: 'dc40dd9461addebbbd8d12b5',
            name: 'Ruth Fadel',
            description:
              'Quasi quis nesciunt id nam. Minus ducimus pariatur veniam beatae modi nam minima sequi rerum. Suscipit ad fugiat quas illo delectus nemo optio delectus doloribus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '886b88da7347fd7c9abcaa2f',
        rules: [
          {
            id: '2811abffd1deca8692fcdbbf',
            name: 'Jan Welch MD',
            description:
              'Quidem delectus id quidem voluptate ratione illo architecto iusto in. Et consequatur voluptas magni. Pariatur quibusdam aliquam blanditiis.',
            orGroups: [],
          },
          {
            id: '2f8d659dcecd6d18f57211d1',
            name: 'Zachary Parker',
            description:
              'Officia minus repellat officiis asperiores qui. Cumque veritatis magnam deserunt. Sunt reprehenderit animi dolores veniam cupiditate quas.',
            orGroups: [],
          },
          {
            id: '6e658340704074bcdb433f58',
            name: 'Francisco Herzog',
            description:
              'Quibusdam necessitatibus est quidem earum veniam nesciunt eaque. At animi expedita. Sint et nostrum sequi officia eos vel. Consequuntur ex quaerat tempore accusamus ea natus qui accusamus quaerat. Aut iure incidunt minima dolores officiis excepturi ratione aut.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c7c7f2abeca8fbbd8fdddab9',
        rules: [
          {
            id: '05ccd6d7d71eceaca38aa7bb',
            name: 'Warren Jacobs',
            description:
              'Exercitationem tempora maxime. Enim veniam quasi libero ea.',
            orGroups: [],
          },
          {
            id: 'b9b789d7b7aacb8ede74f0d1',
            name: 'Brooke Turner',
            description:
              'Similique repellat nobis eum maxime iste. Explicabo qui perferendis quo ducimus. Dolores dolore dolorum voluptates. Soluta molestias tempora deleniti alias error soluta. Modi consequuntur rem magnam natus debitis eligendi eaque iste tempore.',
            orGroups: [],
          },
          {
            id: 'dca99a4af1a5488a2de9d20f',
            name: 'Ignacio Cartwright',
            description:
              'Ab temporibus labore debitis. Voluptatum quam temporibus deserunt. Atque facilis facere sequi nostrum est id unde tenetur sed. Eligendi at pariatur. Voluptatum maiores similique nostrum temporibus sint dolore.',
            orGroups: [],
          },
          {
            id: '6c8eae26ccdce4f3c86002df',
            name: 'Omar Mueller',
            description:
              'Autem corrupti voluptatem libero quibusdam quisquam a. A mollitia omnis. Labore explicabo sequi natus. Ratione quas autem. Natus dolore animi praesentium nobis voluptate tempore ab quasi. Quisquam sequi aperiam facere repellendus.',
            orGroups: [],
          },
          {
            id: '2faadcfa4d4adfa1e6ad2aec',
            name: 'Patti Rice',
            description:
              'Pariatur recusandae error facere repudiandae expedita voluptates. Occaecati culpa perspiciatis repudiandae tempore. Saepe nostrum voluptates.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'eb11b929abc56d7b7eca8ccf',
        rules: [
          {
            id: '5dbdbff77efe6bfd9bbadfcd',
            name: 'Mr. Matthew Beahan',
            description:
              'Itaque dolorem maxime cumque vel. Quibusdam quis reiciendis. Deserunt consequuntur ratione illum. Exercitationem quasi distinctio. Neque mollitia earum.',
            orGroups: [],
          },
          {
            id: '65cbed7dedd26c54ae9af7ae',
            name: 'Katrina Terry',
            description:
              'Dolorum in deleniti vero veniam voluptatem. Optio fuga rerum minima cum neque quod excepturi doloremque. Illo dolores sapiente explicabo quos tempora exercitationem. Veritatis odio officiis id.',
            orGroups: [],
          },
          {
            id: '9f52efea33beb22dd219cfdb',
            name: 'Myron Little',
            description:
              'Unde consequuntur laboriosam nemo reprehenderit odio. Optio qui tenetur quibusdam.',
            orGroups: [],
          },
          {
            id: '53c0d3ebc71b264f8ff110bb',
            name: 'Krista Towne Sr.',
            description:
              'Vitae officiis unde ex necessitatibus veniam inventore velit beatae dolorem. Sequi at dolorem maxime eius excepturi odio earum nobis atque. Iusto voluptatem repellat. Earum asperiores ex ea debitis voluptatibus neque minus est. Tenetur iusto porro incidunt optio magni recusandae neque officiis eaque.',
            orGroups: [],
          },
          {
            id: 'ff73c67e4ec97fbd1450b6be',
            name: 'Winston Huel',
            description:
              'Aliquid doloremque qui tempore molestias accusamus quos harum ut possimus. Adipisci accusantium sit voluptate earum quasi tenetur fugiat dolorem ea.',
            orGroups: [],
          },
          {
            id: '521ca71bfdbdffdedd32ec15',
            name: 'Essie Kris',
            description:
              'Labore quas alias suscipit consequuntur tenetur aut blanditiis. Odit dolorum praesentium id debitis nostrum sit ullam dolores. Libero ipsa assumenda et enim libero. Aut reiciendis eius facilis debitis eius blanditiis facere adipisci sapiente.',
            orGroups: [],
          },
        ],
      },
      {
        id: '45c2dca363ef6faf56cdacbe',
        rules: [
          {
            id: 'ea618dcaed56e6e459170679',
            name: 'Allen Ruecker',
            description:
              'Dolores possimus consectetur fugiat quis. Dolores occaecati accusantium expedita provident earum et ea optio laborum. Totam nulla qui. Dolorum ipsum est veniam commodi fugit culpa aspernatur natus impedit.',
            orGroups: [],
          },
          {
            id: '4d0a4ccbbb6b87be36b4b41e',
            name: 'Christy Conroy',
            description:
              'Corrupti distinctio corporis eveniet soluta. Dicta perspiciatis aliquid tempore. Facilis corrupti iusto culpa consequuntur.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ef74baddda2007fc25a4101c',
        rules: [
          {
            id: 'fff6efe5a0ce0ef3cd8a1ede',
            name: 'Irvin Prosacco III',
            description:
              'Dolorum numquam excepturi reprehenderit ab delectus culpa expedita maiores animi. Assumenda eveniet numquam optio earum autem facere velit totam. Deserunt unde blanditiis ex itaque repellat quisquam praesentium dolorem suscipit.',
            orGroups: [],
          },
          {
            id: 'bfdeccb31ffe57a9e7e43d93',
            name: 'Christian Considine',
            description:
              'Eaque a esse. Magnam cupiditate illo voluptatem hic possimus eveniet.',
            orGroups: [],
          },
          {
            id: 'aea63ad81ce1acbfaea3d967',
            name: 'Alfonso Schmitt',
            description:
              'Aut doloribus dolore perferendis nulla ipsa officiis ut. Odit asperiores debitis incidunt nihil hic sit voluptatem sequi.',
            orGroups: [],
          },
          {
            id: 'cafe9adf6c05a3f0dcebef6a',
            name: 'Derek Runolfsson',
            description:
              'Dolores nisi ad. Omnis suscipit expedita ipsam amet cumque aspernatur deleniti est. Itaque provident id.',
            orGroups: [],
          },
          {
            id: '327c5f9eaa73e1201bffb89a',
            name: 'Brendan Okuneva',
            description:
              'Consequatur distinctio eveniet magnam. Perspiciatis nemo nesciunt itaque. Dignissimos sed quae molestias autem suscipit delectus voluptate. Minus reprehenderit impedit beatae optio doloribus nulla corporis. Eligendi quasi voluptatibus rerum illo accusamus repellat omnis. Quos ducimus dolorem cumque.',
            orGroups: [],
          },
          {
            id: 'dd1ae892c630bac37026d5ef',
            name: 'Dr. Eric Runte',
            description:
              'Quibusdam quam quo veniam ut. Minima soluta repellendus autem quibusdam iusto cum. Similique libero iure explicabo ipsum officia sed modi doloribus. Explicabo facilis architecto amet ea vitae quis veritatis.',
            orGroups: [],
          },
          {
            id: '7a2b10ebb65fca3fbb808b00',
            name: 'Carlos Reichel',
            description:
              'Ea veritatis quas recusandae fugit accusamus hic blanditiis quas id. Voluptatibus architecto culpa perferendis recusandae adipisci. Rerum deleniti facilis. Blanditiis quia incidunt quidem consequatur rem perferendis ab aspernatur. Veniam voluptate numquam delectus minima esse cumque quisquam dolor. Consectetur enim soluta eum.',
            orGroups: [],
          },
        ],
      },
      {
        id: '7d5b73a7cce2a0e9d5aee152',
        rules: [
          {
            id: 'fbf9cf306a67d679ccd6767d',
            name: 'Marsha Kirlin',
            description:
              'Expedita sint soluta nobis inventore quos ratione excepturi vero quasi. Optio quaerat blanditiis blanditiis iste vitae vel. Corporis ab asperiores. Cumque dolore ipsum aperiam assumenda.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '7d5b73a7cce2a0e9d5aee152',
      rules: [
        {
          id: 'fbf9cf306a67d679ccd6767d',
          name: 'Marsha Kirlin',
          description:
            'Expedita sint soluta nobis inventore quos ratione excepturi vero quasi. Optio quaerat blanditiis blanditiis iste vitae vel. Corporis ab asperiores. Cumque dolore ipsum aperiam assumenda.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '4fe4ca7bf709fdf00ceaf4b0',
    name: 'Juanita Lehner',
    description:
      'Dolorum fugit consequuntur deleniti saepe sint. Laboriosam ducimus quae ipsam vero rem dignissimos et. Repellendus autem quia eligendi nulla natus.',
    mainTable: 'McKenzie',
    versions: [
      {
        id: '8f3c9c1efd82bcac1ad9bd6c',
        rules: [
          {
            id: '4297bef00a5d4bab1efc3bc0',
            name: 'Jesse Stark V',
            description:
              'Perspiciatis vitae vitae doloribus suscipit fugiat et quos. Perspiciatis optio vel. Ab quidem cum maxime nobis eveniet similique alias expedita. Repudiandae ex blanditiis accusamus illum necessitatibus aperiam at eaque nesciunt. Iste recusandae voluptatibus omnis cum consequuntur aspernatur dolore ullam. Praesentium provident perferendis officiis provident sed repudiandae non eius temporibus.',
            orGroups: [],
          },
          {
            id: '20697ffcdb5fbc927d565adf',
            name: 'Gene Kutch',
            description:
              'Neque veritatis tempora ipsum temporibus quis sed eos cupiditate similique. Non iure cumque. Voluptatibus corrupti deserunt. Repellat deserunt adipisci fugiat ab facilis molestiae. Expedita officiis officiis deserunt eveniet. Consequuntur molestias doloremque deserunt nisi sapiente velit suscipit.',
            orGroups: [],
          },
          {
            id: 'cfc926834ddccd0f9bc9adb3',
            name: 'Ted Wolff',
            description:
              'Quas in provident voluptatibus. Dicta corrupti veritatis. Consectetur non quod labore. Rerum illum similique. Eveniet alias iste neque. Facilis deleniti laudantium assumenda blanditiis dolor natus animi.',
            orGroups: [],
          },
          {
            id: 'b5fcfe4ec38ddfa03e7fdf34',
            name: 'Renee Zieme',
            description:
              'Fugiat dolorum alias voluptatum harum tempora ab unde. Odit fugiat ea minima quo magni. Nulla velit perspiciatis nisi sapiente excepturi. Id tempore sit perferendis commodi sed. Deleniti quisquam nisi architecto voluptas dicta architecto eum.',
            orGroups: [],
          },
          {
            id: 'baed447b5fbf1d30afa47be8',
            name: 'Roberto Crist',
            description:
              'Sint est odio nesciunt facilis sapiente quae. A quam animi debitis voluptatum. Nemo nesciunt voluptatum nesciunt. Repellat culpa praesentium. Velit rerum repellat accusantium.',
            orGroups: [],
          },
          {
            id: 'a7b844676ccd189f7d4be4da',
            name: 'Deborah Bednar Jr.',
            description:
              'Numquam maxime a expedita animi quaerat sequi architecto. Repellendus recusandae eaque ullam ab dolorem similique laborum consequatur. Ipsum temporibus eum.',
            orGroups: [],
          },
          {
            id: '3ab87f0971d8adfadabeca3d',
            name: 'Francis Cole',
            description:
              'Dignissimos ut saepe repudiandae maxime maxime cumque ea. Accusamus illum quo omnis quis odit dolores amet cumque nesciunt. Vitae distinctio voluptates consectetur quisquam laborum.',
            orGroups: [],
          },
          {
            id: '6ee6e9f28ac8dc0da63bacc7',
            name: 'Jacquelyn Hintz IV',
            description:
              'Perspiciatis maxime esse ut doloremque iure delectus voluptas laboriosam debitis. Dolorem aspernatur dolores saepe deserunt velit tenetur laborum.',
            orGroups: [],
          },
        ],
      },
      {
        id: '874bfeebc731bc5c7dc30cb0',
        rules: [
          {
            id: 'de2fde96bd0d39ca1b4c001c',
            name: 'Lola Bogisich',
            description:
              'Unde voluptatibus similique reprehenderit velit. Officiis at quas reprehenderit.',
            orGroups: [],
          },
          {
            id: 'bd3b757ef4c8d7ff36fda7c9',
            name: 'Christopher Weissnat',
            description:
              'Neque ratione minus vero a dolores eaque expedita. Alias rem animi sunt eius eligendi. Vel architecto eveniet aperiam sequi possimus odio. Deserunt et voluptate consequuntur. Sit esse at adipisci aspernatur autem. Accusantium aliquid molestiae ipsa odit atque deserunt sapiente aspernatur adipisci.',
            orGroups: [],
          },
          {
            id: 'a67a02adcb3baca5afdbbba5',
            name: 'Mamie Davis Sr.',
            description:
              'Rerum dolor nobis assumenda. Beatae tempore nostrum cum placeat vitae.',
            orGroups: [],
          },
          {
            id: 'e3edcffc11ef2082b6f950a9',
            name: 'Rene Hettinger',
            description:
              'Facilis in quos esse tempora. Ipsum adipisci cum doloremque debitis ipsum beatae ut recusandae. Nobis suscipit ipsa placeat placeat. Minima optio porro explicabo adipisci ea quasi aspernatur inventore corporis. Eaque libero mollitia fugit vero deleniti facere quam.',
            orGroups: [],
          },
          {
            id: 'dda61ba9ab43d7ef4eea9ec0',
            name: 'Dr. Esther Bartell',
            description:
              'Illum nostrum expedita expedita impedit aut iusto porro ipsa. Deleniti accusamus libero doloremque. Et error occaecati ex sapiente laborum ducimus odit. Hic possimus totam doloremque magni minus in. Quam possimus quod a quam. Numquam modi velit itaque voluptatum accusamus praesentium dignissimos.',
            orGroups: [],
          },
          {
            id: 'bbcdd75ccfa9bcebf4bfa049',
            name: 'Brian Rowe',
            description:
              'Eligendi maiores repellendus. Aliquid iste placeat commodi reiciendis rem suscipit soluta. Quas inventore suscipit dignissimos accusantium. Commodi ab quae eum fugiat expedita corrupti. Quas facere eos eius quos.',
            orGroups: [],
          },
          {
            id: 'ff0f4e2bbf7d2b451dfe729c',
            name: 'Hugo Okuneva Sr.',
            description:
              'Voluptate labore voluptatum. Enim sequi harum cumque inventore eius explicabo natus temporibus. Exercitationem itaque ullam consectetur laboriosam autem velit qui hic natus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8fca2fd07b8afbbbbdefddc7',
        rules: [
          {
            id: '3f5bdacea14ebc6ebf24ba60',
            name: 'Felicia Schmeler',
            description:
              'Aspernatur laboriosam consequuntur ducimus est nisi autem. Voluptatum ea aperiam officiis odio ab eveniet. Praesentium doloribus reprehenderit. Ratione pariatur quis voluptatem odit ipsum aliquam. Voluptas molestias sapiente natus.',
            orGroups: [],
          },
          {
            id: '33bccafadaf30b0f6abaae0a',
            name: 'Guillermo Wuckert',
            description:
              'Quaerat porro voluptas voluptate hic perspiciatis quae aperiam. Accusamus sequi veritatis facere commodi harum dolorem praesentium sed aut. Porro voluptate aspernatur totam repudiandae nesciunt vitae totam molestiae ducimus. Aspernatur iste nulla totam id. Fugit corporis consequatur odio sunt libero ea. Fugit eius consequuntur harum architecto.',
            orGroups: [],
          },
        ],
      },
      {
        id: '42a303261ffc36cde9ec0eee',
        rules: [
          {
            id: 'b545f08ab12ceddc16adfc96',
            name: 'Gretchen Satterfield',
            description:
              'Velit accusantium impedit reprehenderit fuga culpa. Fugit omnis quis voluptatem reprehenderit officia ratione delectus voluptatum. Nesciunt vero omnis cum sint blanditiis eos facilis sapiente. Nulla nobis exercitationem magnam unde molestiae. Mollitia ut repellat voluptatem non eligendi voluptatem.',
            orGroups: [],
          },
          {
            id: 'ca1bac223ae10c4f543e7939',
            name: 'Aaron Blanda IV',
            description:
              'At itaque eveniet perferendis laudantium magni distinctio repudiandae. Assumenda culpa voluptatibus accusantium.',
            orGroups: [],
          },
          {
            id: '6c325763dcffbc9fed2bbbe9',
            name: 'Floyd Windler',
            description:
              'Quod nesciunt corrupti magnam quas saepe alias dolorum atque ducimus. Eius perspiciatis eius et dolores. Nostrum velit suscipit sint. Ut sint laboriosam ex. Sapiente earum itaque tempora vero alias cupiditate dicta quam. Ullam facilis nostrum distinctio praesentium iusto.',
            orGroups: [],
          },
          {
            id: '3c4efeff8b80caa6accf0455',
            name: 'Bertha Schamberger',
            description:
              'Ratione fugit cum quibusdam quibusdam ex dolore commodi facilis. Culpa blanditiis quisquam tenetur dicta dolore quae totam. Error odio blanditiis incidunt distinctio nulla nobis iusto reiciendis facere. Reprehenderit iste quisquam qui.',
            orGroups: [],
          },
          {
            id: 'cfb4098f2f8ad0ddb10fda0a',
            name: 'Amelia Thompson',
            description:
              'Dolore quia itaque fugit recusandae. Ut quo ullam ipsum ab. Nihil illo at optio. Rerum architecto consequuntur.',
            orGroups: [],
          },
          {
            id: 'd604b5a3aca665c4c446eb8d',
            name: 'Mr. Lillie Cartwright',
            description:
              'Veniam tempora eligendi labore voluptatibus. Sint possimus explicabo maxime laborum occaecati vero maiores molestias. Neque at illum sint.',
            orGroups: [],
          },
          {
            id: '90f99a97f520de33bf7ef6ca',
            name: 'Miss Alan Ullrich',
            description:
              'Fugiat in expedita voluptatem. Autem sint sit. Laborum aliquid aspernatur autem dignissimos quibusdam laborum nobis ipsam. Ipsam sint debitis optio ducimus. Consequuntur placeat et odio sequi.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'd9b9db3050ffff5bff2e45fe',
        rules: [
          {
            id: '23efe6e6848a7fedaf7b62fe',
            name: 'Mr. Estelle Medhurst',
            description:
              'Error nemo quasi. Quas optio nobis officiis consequatur delectus. In tenetur ipsum neque a. Sit sequi eligendi cum eligendi iure iusto et. Perferendis veniam eligendi perspiciatis recusandae.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'fc7cc5ecf674cc6cd9b29b24',
        rules: [
          {
            id: 'ed8f49013b1c43dbfbdb3a8a',
            name: 'Robert McLaughlin',
            description:
              'Aliquid voluptatem molestias eius nulla velit nisi cupiditate. Exercitationem hic quam veritatis minima ipsa molestias iure perferendis esse. Eum eligendi quas voluptates aspernatur reprehenderit eos.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bacab5a78ad9b62bed0e91d0',
        rules: [
          {
            id: 'ca3f699d48f9aacadac38abe',
            name: 'Francis Boyer',
            description:
              'Perspiciatis repudiandae perferendis voluptatum incidunt facilis. Porro perferendis consectetur natus voluptatum aut voluptas optio iusto sequi. Hic aliquid consequatur.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'fa95fa6ebbfb7f97e45be9ba',
        rules: [
          {
            id: '8dac49ec157cd14a5ba08b61',
            name: 'Raul Cassin',
            description:
              'Reprehenderit voluptatibus voluptatum minima ex. Nihil eaque quod vitae distinctio optio ipsum earum perferendis nisi.',
            orGroups: [],
          },
          {
            id: '03992c2079a2c20cbffd7d1d',
            name: 'Carroll Lesch',
            description:
              'Fugiat earum dignissimos necessitatibus. Consequuntur ab sapiente minima neque necessitatibus omnis aut. Quas commodi ipsa tempore similique. Culpa mollitia error. Voluptatem ad fugiat quibusdam illum. Asperiores tempora corporis totam autem non quas.',
            orGroups: [],
          },
          {
            id: 'eaabbffc935a79be2bac9996',
            name: 'Delores Kerluke',
            description: 'Quasi illum maxime. Numquam fuga mollitia ut.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'a87b760f48091d4e0f8529dc',
        rules: [
          {
            id: 'c30abfb9ec4a7a8965c1feeb',
            name: 'Sadie Strosin',
            description:
              'Doloremque facilis commodi culpa aliquid delectus. Perferendis occaecati explicabo. Inventore velit magnam vel sunt expedita illum. Ipsum corrupti quos beatae facilis repudiandae. Explicabo voluptate commodi aliquam molestias alias. Temporibus quia veritatis sapiente consequatur magnam.',
            orGroups: [],
          },
          {
            id: '8ae751ff5ba1cdedcb7b12ef',
            name: 'Jennifer Rowe',
            description:
              'Explicabo ipsum veritatis vitae tenetur ut hic. Rerum beatae veritatis impedit ea consectetur sunt tenetur deleniti. Porro saepe nam voluptate maiores inventore commodi amet deleniti. Perferendis nulla illum aut possimus earum reprehenderit doloribus blanditiis. Fuga reprehenderit aspernatur exercitationem porro. Molestias quia doloribus ducimus ad asperiores suscipit doloribus non doloribus.',
            orGroups: [],
          },
          {
            id: '99362bb1a7de7ae1e52e8ed9',
            name: 'Miss Drew McDermott I',
            description:
              'Hic aliquid minima nulla tenetur molestiae repellat corporis delectus quasi. Enim sapiente quia quam quasi.',
            orGroups: [],
          },
          {
            id: 'f10b9b395fcc1fae8ecaea34',
            name: 'Mr. Angel Cartwright',
            description:
              'Ex assumenda delectus quia alias dolorem. Minus nemo praesentium ipsam fugit dignissimos illo beatae. Sed qui qui magnam. Similique veritatis aut harum necessitatibus labore consectetur sunt. Modi libero aliquid suscipit quaerat. Quo aliquam ea.',
            orGroups: [],
          },
          {
            id: 'f30bfeadac8f208d35a030ef',
            name: 'Carl Gutmann DVM',
            description:
              'Totam veniam ab suscipit adipisci provident. Consequatur et recusandae at inventore pariatur laboriosam nulla enim voluptatem. Et blanditiis rem incidunt. Amet repudiandae aspernatur eum harum a consequuntur adipisci. Quos fuga quidem eveniet rerum minus tenetur doloribus.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'a87b760f48091d4e0f8529dc',
      rules: [
        {
          id: 'c30abfb9ec4a7a8965c1feeb',
          name: 'Sadie Strosin',
          description:
            'Doloremque facilis commodi culpa aliquid delectus. Perferendis occaecati explicabo. Inventore velit magnam vel sunt expedita illum. Ipsum corrupti quos beatae facilis repudiandae. Explicabo voluptate commodi aliquam molestias alias. Temporibus quia veritatis sapiente consequatur magnam.',
          orGroups: [],
        },
        {
          id: '8ae751ff5ba1cdedcb7b12ef',
          name: 'Jennifer Rowe',
          description:
            'Explicabo ipsum veritatis vitae tenetur ut hic. Rerum beatae veritatis impedit ea consectetur sunt tenetur deleniti. Porro saepe nam voluptate maiores inventore commodi amet deleniti. Perferendis nulla illum aut possimus earum reprehenderit doloribus blanditiis. Fuga reprehenderit aspernatur exercitationem porro. Molestias quia doloribus ducimus ad asperiores suscipit doloribus non doloribus.',
          orGroups: [],
        },
        {
          id: '99362bb1a7de7ae1e52e8ed9',
          name: 'Miss Drew McDermott I',
          description:
            'Hic aliquid minima nulla tenetur molestiae repellat corporis delectus quasi. Enim sapiente quia quam quasi.',
          orGroups: [],
        },
        {
          id: 'f10b9b395fcc1fae8ecaea34',
          name: 'Mr. Angel Cartwright',
          description:
            'Ex assumenda delectus quia alias dolorem. Minus nemo praesentium ipsam fugit dignissimos illo beatae. Sed qui qui magnam. Similique veritatis aut harum necessitatibus labore consectetur sunt. Modi libero aliquid suscipit quaerat. Quo aliquam ea.',
          orGroups: [],
        },
        {
          id: 'f30bfeadac8f208d35a030ef',
          name: 'Carl Gutmann DVM',
          description:
            'Totam veniam ab suscipit adipisci provident. Consequatur et recusandae at inventore pariatur laboriosam nulla enim voluptatem. Et blanditiis rem incidunt. Amet repudiandae aspernatur eum harum a consequuntur adipisci. Quos fuga quidem eveniet rerum minus tenetur doloribus.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '411afff352d9c1d4d45e6a8a',
    name: 'Tara Wilderman MD',
    description:
      'Laborum doloribus dicta perferendis sit officiis voluptatem totam voluptate natus. Incidunt neque vero nihil eius natus eveniet.',
    mainTable: 'Altenwerth',
    versions: [
      {
        id: 'ef1f9a9dcbfe01f4f64abdac',
        rules: [
          {
            id: 'e5bdfa12bc575f9aeeda23fa',
            name: 'Josefina Kassulke',
            description:
              'Nobis suscipit error vero repellat. Reprehenderit debitis veniam corporis voluptatum earum corporis rem.',
            orGroups: [],
          },
          {
            id: 'f6e3f3aba9e578bd699bcd92',
            name: 'Wm Bergstrom V',
            description:
              'Vel adipisci dolores labore suscipit. Natus nam saepe facilis.',
            orGroups: [],
          },
          {
            id: 'fcff3ebe7a8ca45f9bcee6fe',
            name: 'Miriam Wiza',
            description:
              'Unde fuga distinctio quod veritatis. In nam sapiente.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f2f2e9fc278ae8c4fdabecc5',
        rules: [
          {
            id: '45fe7d4e8b922d6edf7fdb9a',
            name: 'Gerardo Koch',
            description:
              'Eaque iste fugit at corporis quisquam nesciunt odit. Ratione perferendis est ab quasi amet modi eaque praesentium. Quasi sed a dolorem mollitia ipsa laborum.',
            orGroups: [],
          },
          {
            id: '9e58eeddb5639712fdde3438',
            name: 'Nathaniel Glover III',
            description:
              'Ratione est pariatur cum magnam id quibusdam sed repudiandae. Tempore quam reprehenderit quod. Quia cum atque ut accusamus vitae. Maiores expedita corrupti illum exercitationem. Inventore non earum ut sit et omnis. Ad laborum nihil facere pariatur distinctio voluptas quae assumenda.',
            orGroups: [],
          },
          {
            id: 'fcee4cdc3fde67e9ffec06df',
            name: 'Domingo Hayes',
            description:
              'Ipsum consequuntur illum sunt culpa dolor. Porro voluptatem qui tenetur commodi laborum. Sunt id officiis recusandae est assumenda earum rem.',
            orGroups: [],
          },
          {
            id: '7effacf1cadbe525bda3b1ce',
            name: 'Anita Howe',
            description:
              'Et esse quasi dolorum explicabo dolores. Tempora illo accusantium. Earum quas dolorem. Est expedita nostrum excepturi ex. Veritatis maiores corrupti vel.',
            orGroups: [],
          },
        ],
      },
      {
        id: '6a2594b6cc3ed291fcf7ffe7',
        rules: [
          {
            id: '9e0c12a496ee2efe7efc41f9',
            name: 'Ms. Robin McCullough',
            description:
              'Dignissimos dolor rem aliquam. Inventore quas nam nostrum.',
            orGroups: [],
          },
          {
            id: '4d5cbefeceb60a5342255efb',
            name: "Willie O'Reilly",
            description:
              'Architecto qui minima ex laudantium nulla ea. Fugit nemo vero.',
            orGroups: [],
          },
          {
            id: 'aad9568f4a6ba089a8ea5bb6',
            name: 'Nora Thompson',
            description:
              'Ad neque dolore ab animi incidunt ducimus. Libero quod quae eaque iusto. Id placeat esse placeat deleniti porro quam eligendi corporis harum.',
            orGroups: [],
          },
          {
            id: '4db7854facf7afa91cf143b7',
            name: 'Johnnie Schmidt',
            description:
              'Beatae doloribus molestias. Sit suscipit magnam ex hic molestiae eligendi corrupti quibusdam illum.',
            orGroups: [],
          },
          {
            id: 'dc5c54f4a5dddda789d6abbb',
            name: 'Tony Miller',
            description:
              'Ab odit modi odit culpa numquam. Iure beatae modi repudiandae animi nobis mollitia nobis architecto.',
            orGroups: [],
          },
          {
            id: '9dfeaa8de756ba91dbbecafd',
            name: 'Andy Green',
            description:
              'Expedita veniam ipsum et dolor reiciendis. Nam laboriosam aspernatur omnis sapiente voluptatibus quam accusantium deleniti quia. Non voluptas voluptates vel soluta ratione vel maiores dolorum culpa. Temporibus voluptas nostrum tempora. Perspiciatis ducimus voluptatem nam non explicabo eveniet. Illo libero quas eveniet distinctio atque quas.',
            orGroups: [],
          },
          {
            id: 'b89ae4e53fcfde431ae831e9',
            name: 'Virginia Lebsack Sr.',
            description:
              'Ad aut vel ipsam eveniet aperiam. Autem quibusdam voluptas. Ab odio et libero ratione cumque. Laborum recusandae illum. Quaerat pariatur saepe nulla ut.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8ecf42d52acdbbedfac35724',
        rules: [
          {
            id: '4ce44049efec298af1dfdec4',
            name: 'Matthew Leannon',
            description:
              'Ipsam beatae eius ad voluptatibus corrupti. Hic tenetur voluptatum laborum dignissimos animi. Pariatur suscipit iure quisquam esse ea. Cum ullam eos mollitia. Facilis a nihil molestias vel consequuntur odio officiis hic.',
            orGroups: [],
          },
          {
            id: '04ee471cfeaea925aacb4fbb',
            name: 'Casey Tillman IV',
            description:
              'Rerum aliquam totam fugit odit eius omnis quasi. Labore hic aliquam aliquid doloremque laudantium facere itaque.',
            orGroups: [],
          },
          {
            id: '68ccdfcb76c0bbd2a9f4d3c5',
            name: 'Kenny Lehner',
            description:
              'Commodi exercitationem optio. Dignissimos voluptates aspernatur exercitationem commodi rem cupiditate. Tenetur tenetur architecto sit ipsam iure. Fugiat nesciunt voluptatum dolorem perferendis eveniet temporibus similique consequuntur iusto.',
            orGroups: [],
          },
          {
            id: 'ad9df3adef70c4f39af679f0',
            name: 'Darnell Spencer',
            description:
              'Laboriosam soluta harum porro amet. Voluptate perferendis pariatur. Dicta voluptatibus quia. Porro eveniet ipsum libero quae dolor illum.',
            orGroups: [],
          },
          {
            id: '2a69c7d585fcca5beb9bd0e8',
            name: 'Kristopher Lueilwitz',
            description:
              'Repellat tempora iste. Incidunt fuga quidem. Omnis quisquam laborum illum facere corporis dolor eos similique. Saepe dolorum sequi tenetur voluptatum laborum quis hic hic molestiae. Quis at fuga quasi molestias.',
            orGroups: [],
          },
          {
            id: 'ae66bf70140c7ea5d0fe0076',
            name: 'Ted Bode',
            description:
              'Cum nobis quae dolorum. A placeat sed ea ad dolores possimus. Sed temporibus quisquam est pariatur amet voluptatum commodi deleniti rerum.',
            orGroups: [],
          },
          {
            id: 'a777c9d3b2a9d7b8751c1046',
            name: 'Kristi Murphy',
            description:
              'Esse culpa illo corrupti pariatur sunt. Dicta reprehenderit impedit earum voluptatibus. Nostrum quia labore eos natus atque nesciunt.',
            orGroups: [],
          },
          {
            id: '9b864bce8efdd3cdcc710ddd',
            name: 'Carroll Price III',
            description:
              'Facilis velit eligendi. Iste eum quisquam voluptates ut odit ipsam autem dignissimos.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8b3574cc7bbddefcd2d599c5',
        rules: [
          {
            id: 'c6ee8d114a5befa13d241191',
            name: 'Edward Crist',
            description:
              'Nihil quod vitae sit repellat numquam. Beatae modi dolores sed dolor fugiat tenetur. Cumque iste pariatur totam ipsam ullam. Perferendis nulla sapiente molestias neque ipsum explicabo. Dolores eveniet saepe.',
            orGroups: [],
          },
          {
            id: '4fc4fec3be9fd35adbabe1fd',
            name: 'Marianne Green',
            description:
              'Esse aperiam blanditiis nisi. Ipsa illo quibusdam accusantium harum optio delectus natus eveniet. Maxime sunt vel esse corrupti perferendis at. Exercitationem vel excepturi iste eaque laborum natus alias. Alias consequuntur accusamus aut deserunt quod atque consequuntur.',
            orGroups: [],
          },
          {
            id: 'd8e09bfee91dd5cbabdfa2ba',
            name: 'Lindsey Jones',
            description:
              'Doloribus vero vel quos. Veritatis aspernatur consectetur quis. Laborum voluptatem quo rem in esse perferendis ex perferendis veritatis. Quaerat occaecati exercitationem sequi alias. Optio eum possimus inventore corporis adipisci impedit nemo.',
            orGroups: [],
          },
          {
            id: 'addcc493c5d01a1c374fffdc',
            name: 'Ben Ward',
            description:
              'Modi quibusdam illo blanditiis quaerat occaecati voluptatibus vel. Aut voluptate praesentium ipsum quis quos corrupti sapiente corrupti. Eveniet nulla aliquam consequatur consequatur sit praesentium. Iure quidem modi ab et ab dolore tempore dolorem sit. Ratione repellat esse.',
            orGroups: [],
          },
          {
            id: '4aedf2a6047cf52e53749c56',
            name: 'Bob Cole DVM',
            description:
              'Nulla sequi molestiae quos temporibus vitae non numquam assumenda inventore. Tempore iste temporibus suscipit sed totam. Aliquid culpa possimus veritatis voluptas neque in aliquid fugit.',
            orGroups: [],
          },
        ],
      },
      {
        id: '2f7edfeb592bf811a4651a6b',
        rules: [
          {
            id: '8e5bcf0feab4dbda98ed17df',
            name: 'Charlene Towne',
            description:
              'Deserunt odit autem perspiciatis pariatur dicta. Natus perspiciatis blanditiis ratione aperiam. Neque sint et animi laboriosam rem incidunt odit. Corrupti at neque. Fugit rerum earum alias ipsum facilis.',
            orGroups: [],
          },
          {
            id: '6c9ebaec205c086ba3afe31f',
            name: 'Deanna Baumbach',
            description:
              'Officiis alias aspernatur tempore delectus. Corporis debitis nam ad incidunt.',
            orGroups: [],
          },
          {
            id: 'dbebfe9dbceb54e196bd7952',
            name: 'Sheryl Heidenreich',
            description:
              'Neque nulla eveniet distinctio error enim nemo. At error animi officiis. Quibusdam porro dolorum.',
            orGroups: [],
          },
          {
            id: '0dd69052aeb1adb5aa5e86de',
            name: 'Paulette Fadel',
            description:
              'Aliquam iusto ex iusto ipsum voluptatibus nesciunt deleniti corporis. Deleniti vel a voluptatibus incidunt a perspiciatis iste id nesciunt. Eveniet ipsum suscipit quaerat dicta numquam excepturi sapiente velit facere. Voluptates dolorem eligendi repellat consectetur nobis. Voluptate vitae perspiciatis. Veritatis labore pariatur.',
            orGroups: [],
          },
          {
            id: 'e7dacce635ddfdafa6f24bcd',
            name: 'Rachael Fisher',
            description:
              'Laboriosam consequuntur eveniet iure. Natus occaecati pariatur vero. Pariatur placeat quibusdam magni praesentium. Dolor consequuntur qui asperiores sint fugit cumque labore laudantium autem. Error voluptatem at laboriosam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '30ebfbabed5a554fdcaa624a',
        rules: [
          {
            id: 'd9497f07b3e89444dd77fb9e',
            name: 'Ms. Traci Yundt',
            description:
              'Minima quibusdam dolorem molestias necessitatibus perspiciatis velit voluptate id tenetur. Nesciunt repellat consectetur eos placeat odit debitis. Vitae aliquid aspernatur nam cum veritatis iusto. Doloribus facere velit est nulla consequatur architecto. Repellat nostrum corporis eius animi animi.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '30ebfbabed5a554fdcaa624a',
      rules: [
        {
          id: 'd9497f07b3e89444dd77fb9e',
          name: 'Ms. Traci Yundt',
          description:
            'Minima quibusdam dolorem molestias necessitatibus perspiciatis velit voluptate id tenetur. Nesciunt repellat consectetur eos placeat odit debitis. Vitae aliquid aspernatur nam cum veritatis iusto. Doloribus facere velit est nulla consequatur architecto. Repellat nostrum corporis eius animi animi.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'dfc1bed60beff38dce0fe684',
    name: 'Hugh Corkery',
    description:
      'Ea quia ab nobis consequuntur. Necessitatibus repellat repudiandae architecto repellat ullam ex voluptatum vitae necessitatibus. Repellendus accusantium dolores consequuntur animi. Officia suscipit magnam error deleniti. Consequuntur ex provident incidunt hic maxime perferendis repellendus. Maiores cumque enim quis ad eum inventore dignissimos id.',
    mainTable: 'Hudson',
    versions: [
      {
        id: '68d2a3acc5ee4a2e5aea9ea0',
        rules: [
          {
            id: 'fee7f9dfaeaee6fd2a18defa',
            name: 'Eunice Willms PhD',
            description:
              'Blanditiis eveniet provident exercitationem cupiditate molestias. Voluptatibus minima sint voluptatibus praesentium itaque expedita inventore.',
            orGroups: [],
          },
        ],
      },
      {
        id: '6482cecc9e135dbf1f23da2e',
        rules: [
          {
            id: '27b595dbdb3bccc2ef2c3dad',
            name: 'Jody Kling',
            description:
              'Voluptates non consectetur ex. Mollitia provident ex repellat consectetur consequatur voluptate. Ullam deleniti hic enim et animi suscipit in sed. Voluptatem numquam nemo.',
            orGroups: [],
          },
        ],
      },
      {
        id: '0bdcfbfb7867a59aec9f3caa',
        rules: [
          {
            id: '2b86580ec7d7d8eacdb6f5aa',
            name: 'Candace Volkman',
            description:
              'Magnam esse quisquam repudiandae delectus. Totam deleniti ipsam perspiciatis velit eum consequuntur incidunt quasi unde. Aut facere numquam. Ab officiis voluptas. Sed corporis rerum aspernatur odit tempore recusandae magnam deleniti.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '0bdcfbfb7867a59aec9f3caa',
      rules: [
        {
          id: '2b86580ec7d7d8eacdb6f5aa',
          name: 'Candace Volkman',
          description:
            'Magnam esse quisquam repudiandae delectus. Totam deleniti ipsam perspiciatis velit eum consequuntur incidunt quasi unde. Aut facere numquam. Ab officiis voluptas. Sed corporis rerum aspernatur odit tempore recusandae magnam deleniti.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'aeff8b2acfef6d7ea16de7c3',
    name: 'Spencer Koelpin',
    description:
      'Debitis hic facilis expedita excepturi. Consequatur deserunt eveniet. Iste corrupti beatae ut exercitationem aliquam. Quas corrupti minima sapiente culpa.',
    mainTable: 'Carroll',
    versions: [
      {
        id: 'f22e2d9256ecd5d196229c34',
        rules: [
          {
            id: '0549b4aeb607e1ff2a0f3ebd',
            name: 'Carl Cartwright',
            description:
              'Officia dolore consequuntur dolore beatae. Qui rerum debitis dicta quasi magni. In recusandae perferendis debitis fugit natus. Suscipit eligendi commodi. Odit assumenda nesciunt voluptas. Nobis veritatis voluptates non laborum aspernatur.',
            orGroups: [],
          },
          {
            id: '33b42e5afecea808a8855d52',
            name: 'Maggie Paucek',
            description:
              'Placeat alias necessitatibus aperiam sunt tempore pariatur. Architecto nesciunt consequatur est temporibus magni eum id voluptatibus.',
            orGroups: [],
          },
          {
            id: '4e8d8ae3a182b0acece680a1',
            name: "Hugo O'Keefe",
            description:
              'Dolore quasi fugit labore molestias temporibus voluptate porro vero sunt. Consectetur velit quam voluptatem minima optio animi. Ab tempora impedit alias repellat incidunt voluptatem dolore a.',
            orGroups: [],
          },
          {
            id: 'af12bdefae3cc34cba0a8eb1',
            name: 'Minnie Wolff',
            description:
              'Cupiditate ratione labore. Odio similique culpa aspernatur ratione quae consectetur doloremque necessitatibus distinctio. Officia illum soluta rem pariatur.',
            orGroups: [],
          },
          {
            id: 'fe5bdc0febad875ce1ccf4bb',
            name: 'Mr. Erma Tromp',
            description:
              'Mollitia dicta ut unde itaque nulla sapiente. Non fugiat cumque accusamus eum eum. Eos inventore consectetur.',
            orGroups: [],
          },
          {
            id: '0d7edeaa1bbacb2ad51056d2',
            name: 'Max King',
            description:
              'Vitae architecto unde amet. Perferendis excepturi quas odio nostrum optio.',
            orGroups: [],
          },
          {
            id: 'c8a6dfff3eecfa6a3fabcc6c',
            name: 'Felicia Hammes',
            description:
              'Omnis et iusto explicabo dicta libero. Placeat minima repellendus natus labore aliquid voluptates quo quis rerum. Suscipit dolore animi voluptates corrupti. Eos soluta iure corporis vero quisquam dolor saepe. Deserunt ducimus doloribus commodi a. Ea in quis pariatur occaecati.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'f22e2d9256ecd5d196229c34',
      rules: [
        {
          id: '0549b4aeb607e1ff2a0f3ebd',
          name: 'Carl Cartwright',
          description:
            'Officia dolore consequuntur dolore beatae. Qui rerum debitis dicta quasi magni. In recusandae perferendis debitis fugit natus. Suscipit eligendi commodi. Odit assumenda nesciunt voluptas. Nobis veritatis voluptates non laborum aspernatur.',
          orGroups: [],
        },
        {
          id: '33b42e5afecea808a8855d52',
          name: 'Maggie Paucek',
          description:
            'Placeat alias necessitatibus aperiam sunt tempore pariatur. Architecto nesciunt consequatur est temporibus magni eum id voluptatibus.',
          orGroups: [],
        },
        {
          id: '4e8d8ae3a182b0acece680a1',
          name: "Hugo O'Keefe",
          description:
            'Dolore quasi fugit labore molestias temporibus voluptate porro vero sunt. Consectetur velit quam voluptatem minima optio animi. Ab tempora impedit alias repellat incidunt voluptatem dolore a.',
          orGroups: [],
        },
        {
          id: 'af12bdefae3cc34cba0a8eb1',
          name: 'Minnie Wolff',
          description:
            'Cupiditate ratione labore. Odio similique culpa aspernatur ratione quae consectetur doloremque necessitatibus distinctio. Officia illum soluta rem pariatur.',
          orGroups: [],
        },
        {
          id: 'fe5bdc0febad875ce1ccf4bb',
          name: 'Mr. Erma Tromp',
          description:
            'Mollitia dicta ut unde itaque nulla sapiente. Non fugiat cumque accusamus eum eum. Eos inventore consectetur.',
          orGroups: [],
        },
        {
          id: '0d7edeaa1bbacb2ad51056d2',
          name: 'Max King',
          description:
            'Vitae architecto unde amet. Perferendis excepturi quas odio nostrum optio.',
          orGroups: [],
        },
        {
          id: 'c8a6dfff3eecfa6a3fabcc6c',
          name: 'Felicia Hammes',
          description:
            'Omnis et iusto explicabo dicta libero. Placeat minima repellendus natus labore aliquid voluptates quo quis rerum. Suscipit dolore animi voluptates corrupti. Eos soluta iure corporis vero quisquam dolor saepe. Deserunt ducimus doloribus commodi a. Ea in quis pariatur occaecati.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'baae35f4db5af04fceabb7ef',
    name: 'Rodolfo Cummings',
    description:
      'At rem omnis aliquam ipsum eligendi a veniam. Libero similique impedit a possimus. Eius distinctio quibusdam quidem vitae soluta repellat rerum. Culpa saepe dignissimos error. Ipsam excepturi nobis unde sit incidunt quas. Dicta fuga libero neque.',
    mainTable: 'Borer',
    versions: [
      {
        id: '6a2a7d4b305ba37e630cb9ff',
        rules: [
          {
            id: 'e54f92df77e4e36dee220b5d',
            name: 'Drew Klein',
            description:
              'Ut consequuntur quaerat illum maiores accusamus perspiciatis. Nesciunt quos illo eveniet ex vitae aut officiis odio. Eius nobis voluptas nam velit saepe quos.',
            orGroups: [],
          },
          {
            id: 'cae9eba56ddfad829db073a2',
            name: 'Meghan Rempel',
            description:
              'Mollitia nulla impedit laudantium maxime sint sunt pariatur quas quos. Nobis quo earum enim labore quibusdam possimus. Quibusdam nobis dolorum amet facere porro harum expedita. Omnis ipsam corporis vero laborum asperiores.',
            orGroups: [],
          },
          {
            id: 'b69df70d052e8ddde6f6518a',
            name: 'Krystal Lynch DDS',
            description:
              'Adipisci adipisci eaque aut. Corporis ad sapiente. Itaque a pariatur eos nesciunt iusto. Quam consequuntur porro laboriosam aperiam. Magnam suscipit amet voluptates mollitia harum voluptate error quia alias. Iure nam provident adipisci beatae ea harum illum.',
            orGroups: [],
          },
          {
            id: 'c481d3dae7715f583bbe69e5',
            name: 'Ms. Owen Rempel PhD',
            description:
              'Nostrum eligendi inventore. Voluptatem dolorem molestias error. Non perspiciatis odit sit minus necessitatibus exercitationem totam. Nesciunt fuga quod tempore explicabo molestiae sunt blanditiis. Dolores nisi voluptatibus. Deserunt magnam ipsum consectetur.',
            orGroups: [],
          },
          {
            id: '0bacd5230fff8673ac3caa9e',
            name: 'Michelle Streich',
            description:
              'Harum ipsum ipsam porro perferendis nesciunt voluptatem culpa dignissimos excepturi. Distinctio voluptatibus adipisci provident quasi excepturi. Recusandae ipsa expedita maxime. Laboriosam consequuntur tempora rem est quos fugit ipsam sequi aperiam.',
            orGroups: [],
          },
          {
            id: 'fd2856b68bfb1441d77ce8b4',
            name: 'Jan Lueilwitz',
            description:
              'Distinctio sint illo quae excepturi. Similique quod ad reprehenderit nobis eveniet placeat rerum asperiores vitae. Numquam pariatur molestiae fugit. Veritatis corporis beatae. Atque vitae sunt deleniti quidem sapiente reprehenderit debitis eum. Voluptate fugit placeat.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bf5ebb4ddd95aca479fcdf1e',
        rules: [
          {
            id: 'ffcfddafc17d645028b0acb3',
            name: 'Mr. Nina White',
            description:
              'Ipsum rem omnis iste accusantium. Aliquid animi eligendi occaecati illo consequuntur quasi. Doloribus labore facilis consequuntur officiis eos ex sed adipisci. Ratione rerum provident placeat iste repellendus sequi eius placeat rerum.',
            orGroups: [],
          },
          {
            id: 'efc60f8bdb1c67b0ed5f2c60',
            name: 'Bob Ernser',
            description:
              'Ducimus architecto quae soluta animi sequi quaerat. Neque amet saepe delectus deserunt quae. Et veniam fugit quas hic quaerat labore.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'bf5ebb4ddd95aca479fcdf1e',
      rules: [
        {
          id: 'ffcfddafc17d645028b0acb3',
          name: 'Mr. Nina White',
          description:
            'Ipsum rem omnis iste accusantium. Aliquid animi eligendi occaecati illo consequuntur quasi. Doloribus labore facilis consequuntur officiis eos ex sed adipisci. Ratione rerum provident placeat iste repellendus sequi eius placeat rerum.',
          orGroups: [],
        },
        {
          id: 'efc60f8bdb1c67b0ed5f2c60',
          name: 'Bob Ernser',
          description:
            'Ducimus architecto quae soluta animi sequi quaerat. Neque amet saepe delectus deserunt quae. Et veniam fugit quas hic quaerat labore.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '03b6b2bd556bb1dfa815aeb2',
    name: 'Mrs. Guillermo Abernathy',
    description:
      'Nisi quis suscipit tenetur reiciendis adipisci necessitatibus. Alias quas aspernatur. Dolores dolores facere aspernatur accusantium. Incidunt ullam labore repellat. Natus quod sit soluta hic eius.',
    mainTable: 'Koelpin',
    versions: [
      {
        id: '87e7d89dfbbfee2f85fefefc',
        rules: [
          {
            id: 'f4107bba5eb8bd72ea2cc03b',
            name: 'Kristie Mraz',
            description:
              'Est distinctio iste rerum reiciendis. Deleniti sint labore dolorem.',
            orGroups: [],
          },
          {
            id: 'ffcd44550e7e340082de2fce',
            name: 'Jermaine Jast',
            description:
              'Cumque necessitatibus officia modi dolore. A facere inventore voluptatem autem distinctio in. Facilis accusantium numquam animi sint repudiandae iure totam modi. Natus recusandae repellat suscipit voluptate sed tempore earum. Vel consectetur a deleniti labore voluptate.',
            orGroups: [],
          },
          {
            id: 'a62e02ff075e0fb8fad0cc8b',
            name: 'David Stark',
            description:
              'Necessitatibus reprehenderit alias laborum in nostrum odit aspernatur. Laudantium dicta amet sit consequatur maxime. Repellat dicta harum iusto voluptates. Magni culpa beatae laudantium dolor quasi.',
            orGroups: [],
          },
          {
            id: '1609bfcddf1711e6fc51aa68',
            name: 'Frances Grady',
            description:
              'Accusamus odit quas omnis nam. Iusto id culpa nostrum. Deleniti occaecati sint est corrupti amet.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '87e7d89dfbbfee2f85fefefc',
      rules: [
        {
          id: 'f4107bba5eb8bd72ea2cc03b',
          name: 'Kristie Mraz',
          description:
            'Est distinctio iste rerum reiciendis. Deleniti sint labore dolorem.',
          orGroups: [],
        },
        {
          id: 'ffcd44550e7e340082de2fce',
          name: 'Jermaine Jast',
          description:
            'Cumque necessitatibus officia modi dolore. A facere inventore voluptatem autem distinctio in. Facilis accusantium numquam animi sint repudiandae iure totam modi. Natus recusandae repellat suscipit voluptate sed tempore earum. Vel consectetur a deleniti labore voluptate.',
          orGroups: [],
        },
        {
          id: 'a62e02ff075e0fb8fad0cc8b',
          name: 'David Stark',
          description:
            'Necessitatibus reprehenderit alias laborum in nostrum odit aspernatur. Laudantium dicta amet sit consequatur maxime. Repellat dicta harum iusto voluptates. Magni culpa beatae laudantium dolor quasi.',
          orGroups: [],
        },
        {
          id: '1609bfcddf1711e6fc51aa68',
          name: 'Frances Grady',
          description:
            'Accusamus odit quas omnis nam. Iusto id culpa nostrum. Deleniti occaecati sint est corrupti amet.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'ec6cdde5f3287d1a6b5bc4d0',
    name: 'Mrs. Stuart Flatley Sr.',
    description:
      'Laborum eius voluptates. Qui beatae ipsa. Fuga itaque eius iusto unde. Exercitationem dignissimos velit quas nam. Ullam quos error non. Quo fugit tempora.',
    mainTable: 'Johnston',
    versions: [
      {
        id: '8b4d9dd5cc0a41c209c1cb7d',
        rules: [
          {
            id: 'a570837dfdefd4c26f4737d0',
            name: "Jasmine O'Connell",
            description:
              'Maxime totam nobis est perspiciatis quis culpa ratione. Velit molestias et ad animi. Quos magnam odio. At ea accusantium.',
            orGroups: [],
          },
          {
            id: '9d42e0d2f69cd68dbe6d0ca0',
            name: 'Stephen Weissnat',
            description:
              'Temporibus in ipsum. Eveniet ducimus asperiores amet doloribus magni. Suscipit ipsam adipisci architecto quas.',
            orGroups: [],
          },
          {
            id: '33af310ecab3c658cf9dcad9',
            name: 'Miss Mae Graham V',
            description:
              'Illo ad similique molestias ducimus ducimus neque ad in. Perspiciatis facilis ut aspernatur asperiores veniam libero doloribus consectetur repellat.',
            orGroups: [],
          },
          {
            id: 'ddee3cac7b1326f8e2f1ddb8',
            name: 'Ron Monahan',
            description:
              'Culpa quasi doloribus quis fugit. Adipisci ipsam adipisci qui non magni. Soluta consectetur voluptates.',
            orGroups: [],
          },
          {
            id: 'fba1080eac63cfce1d76697c',
            name: 'Barry Wyman',
            description:
              'Ducimus rem suscipit delectus nostrum ut ullam culpa. Facilis maxime omnis est saepe adipisci repellat quidem magni. Molestiae harum sequi vel laudantium numquam minus corrupti non. Laudantium placeat nam. Earum odio neque aut alias. Nulla deleniti recusandae tempora nam delectus dolorum officia ratione assumenda.',
            orGroups: [],
          },
        ],
      },
      {
        id: '464fe6732fe4f92218f1bc65',
        rules: [
          {
            id: '50e470aea5a792fb81b04a8d',
            name: 'Ken White',
            description:
              'Iste dolores eos exercitationem dignissimos ipsam officia eveniet architecto. Dolores error sunt dolor ad. Quaerat dolor ex nihil voluptates. Commodi veritatis inventore cupiditate corporis molestias id architecto molestiae assumenda. Aspernatur accusamus error voluptatum numquam tenetur in voluptas.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bdbfdadd71406aa5b70e04ff',
        rules: [
          {
            id: '0a7a4d3536eabfa40edc8cb7',
            name: 'Troy Kunde',
            description:
              'Ex est consequatur illum quas tenetur quae provident. Nihil explicabo quod nesciunt. Enim ex repellendus odio temporibus. Quibusdam rem porro sit odio amet eaque.',
            orGroups: [],
          },
          {
            id: '1fef8d0adeef32adfd9ecde2',
            name: 'Gary Jenkins',
            description:
              'Delectus blanditiis quam odit provident officia a est voluptate quos. Explicabo vero eaque architecto distinctio reiciendis ducimus molestias doloremque.',
            orGroups: [],
          },
          {
            id: '4b02b6fc6a18d9ebc5e885c6',
            name: 'Ron Mertz III',
            description:
              'Adipisci nostrum voluptatum iure laborum fugiat. Ratione neque consequuntur repellat magnam quo molestias repellat. Molestiae eos pariatur distinctio deserunt dolore porro praesentium blanditiis. Ab eligendi id quod accusantium aliquam possimus consectetur. Quisquam amet enim doloremque nobis vitae doloremque saepe.',
            orGroups: [],
          },
          {
            id: 'eed930aa59c22edfc81ab2eb',
            name: 'Bonnie Konopelski',
            description:
              'Quam nam architecto in. Doloribus repudiandae similique minima nisi officia vero impedit. Culpa hic est perferendis est saepe excepturi nisi. Fugiat recusandae rerum.',
            orGroups: [],
          },
          {
            id: '5fca850eabea9cd15a2617bf',
            name: 'Don Stokes',
            description:
              'Deserunt esse ipsum. Iure quibusdam labore autem aliquam commodi soluta. Delectus praesentium vitae alias fugiat. Nostrum architecto vero iure odio quia. Reiciendis repellat exercitationem laudantium. Labore corporis a earum ipsa repellendus maxime facere.',
            orGroups: [],
          },
          {
            id: '642bafb64ddb0ab41dcea2ad',
            name: 'Inez Hayes V',
            description:
              'Architecto impedit rerum provident et magni eaque. Harum optio dolorum minus molestiae incidunt quos. Nostrum recusandae aliquam. Corporis rem beatae delectus. Repellendus ipsum dolores. Odit sint officiis.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'bdbfdadd71406aa5b70e04ff',
      rules: [
        {
          id: '0a7a4d3536eabfa40edc8cb7',
          name: 'Troy Kunde',
          description:
            'Ex est consequatur illum quas tenetur quae provident. Nihil explicabo quod nesciunt. Enim ex repellendus odio temporibus. Quibusdam rem porro sit odio amet eaque.',
          orGroups: [],
        },
        {
          id: '1fef8d0adeef32adfd9ecde2',
          name: 'Gary Jenkins',
          description:
            'Delectus blanditiis quam odit provident officia a est voluptate quos. Explicabo vero eaque architecto distinctio reiciendis ducimus molestias doloremque.',
          orGroups: [],
        },
        {
          id: '4b02b6fc6a18d9ebc5e885c6',
          name: 'Ron Mertz III',
          description:
            'Adipisci nostrum voluptatum iure laborum fugiat. Ratione neque consequuntur repellat magnam quo molestias repellat. Molestiae eos pariatur distinctio deserunt dolore porro praesentium blanditiis. Ab eligendi id quod accusantium aliquam possimus consectetur. Quisquam amet enim doloremque nobis vitae doloremque saepe.',
          orGroups: [],
        },
        {
          id: 'eed930aa59c22edfc81ab2eb',
          name: 'Bonnie Konopelski',
          description:
            'Quam nam architecto in. Doloribus repudiandae similique minima nisi officia vero impedit. Culpa hic est perferendis est saepe excepturi nisi. Fugiat recusandae rerum.',
          orGroups: [],
        },
        {
          id: '5fca850eabea9cd15a2617bf',
          name: 'Don Stokes',
          description:
            'Deserunt esse ipsum. Iure quibusdam labore autem aliquam commodi soluta. Delectus praesentium vitae alias fugiat. Nostrum architecto vero iure odio quia. Reiciendis repellat exercitationem laudantium. Labore corporis a earum ipsa repellendus maxime facere.',
          orGroups: [],
        },
        {
          id: '642bafb64ddb0ab41dcea2ad',
          name: 'Inez Hayes V',
          description:
            'Architecto impedit rerum provident et magni eaque. Harum optio dolorum minus molestiae incidunt quos. Nostrum recusandae aliquam. Corporis rem beatae delectus. Repellendus ipsum dolores. Odit sint officiis.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'cc75caa1faebd9d3c6bbfced',
    name: 'Jeannette Zboncak',
    description:
      'Magni vel amet accusantium. Distinctio dolores numquam assumenda unde. Odit incidunt non rem. Aliquid aperiam quis nihil cum rerum.',
    mainTable: 'Satterfield',
    versions: [
      {
        id: 'b5cc4ce0d414edf1f9ff64bb',
        rules: [
          {
            id: '13ecd5e3bb042cecd70f0d32',
            name: 'Judy Gleason',
            description:
              'Voluptatum quia qui. Maiores repellendus officiis quaerat. Enim doloremque adipisci quae eum consequuntur distinctio aspernatur cum similique. Illum optio alias. Odio quia ratione asperiores. Expedita perspiciatis modi nemo.',
            orGroups: [],
          },
          {
            id: '4a1aa7a823ad734983d7d329',
            name: 'Tonya Graham',
            description:
              'Placeat consectetur dicta dolorum alias consectetur quo. Quod similique aliquid perferendis labore iste.',
            orGroups: [],
          },
          {
            id: 'feae7eba3ea6cccc2d35bcd5',
            name: 'Rochelle Cartwright',
            description:
              'Aliquam officia similique perspiciatis voluptas facere tempore sequi officiis. Voluptate tempora dolorem dolorum exercitationem minima atque non tempora sed. Possimus ab veniam illo voluptatum vero. Magnam autem quod aliquam in amet alias accusamus ipsa soluta.',
            orGroups: [],
          },
          {
            id: '7ed11b1c94bfc4b5bdce0240',
            name: 'Heidi Wolf V',
            description:
              'Quas quo iusto sequi quisquam. At nemo impedit. Illo est tenetur minus earum nemo minus culpa magnam. Dignissimos magni incidunt possimus. Quis amet aliquid quam.',
            orGroups: [],
          },
          {
            id: 'b36645cb4c8d6cb86542b1dd',
            name: 'Myron McClure',
            description:
              'Inventore repellat cupiditate veritatis quo quo. In dolorum iste quaerat deserunt nesciunt eum culpa excepturi. Sequi minima ut dolorum autem fugiat ullam et. Consectetur ea et deleniti. Sunt ullam dolor.',
            orGroups: [],
          },
          {
            id: '126b9e485f1db7ea1de97e4e',
            name: 'Alison Blick',
            description:
              'Aliquid nemo quibusdam consectetur maxime architecto error. Officia corrupti ea est earum officiis eaque voluptatem. Ratione aspernatur ipsum maiores eius fugit. Sunt eos et repellat quidem quos fugiat non. Corrupti nulla ullam voluptatum possimus officiis quibusdam perferendis. Suscipit voluptatibus rem.',
            orGroups: [],
          },
          {
            id: '135efac9a67c055343def7cf',
            name: 'Tonya Muller',
            description:
              'Perspiciatis quod corrupti ipsa. Sapiente autem laudantium perspiciatis explicabo similique magni. Voluptas maxime ipsam impedit accusantium maxime quibusdam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '667e722ef1d9b1fa5bba328e',
        rules: [
          {
            id: 'ae0d4c2f2a4cb06f63f8c047',
            name: 'Raul Dare',
            description:
              'Doloribus saepe dolor ipsam esse ipsa illum quas qui. Similique accusantium nisi quidem. Quis quas nihil repellendus dicta fuga id amet qui.',
            orGroups: [],
          },
          {
            id: '7f4ac896c806a8e45aef8e8d',
            name: 'Sara Braun',
            description:
              'Beatae quos porro sunt. Consequatur nulla repudiandae deserunt pariatur doloremque. Quia accusamus architecto possimus in eveniet voluptates. Iure velit aperiam distinctio ratione minus saepe.',
            orGroups: [],
          },
          {
            id: '4cb2dbc7fdd6aaf189ceeeb1',
            name: 'Erma Walsh',
            description:
              'Similique tenetur eius nam reiciendis modi ad molestias nobis. Perspiciatis ad harum sed magnam. Neque eligendi asperiores et. In laborum cum quo et delectus eaque recusandae. Reprehenderit aperiam facere adipisci libero excepturi illum quisquam.',
            orGroups: [],
          },
          {
            id: 'ab828d8c17efb4d82e1a5d9c',
            name: 'Johnnie Gusikowski',
            description:
              'Rerum officia dicta earum dolorem quisquam quia quibusdam officia quae. Nam dolorem laboriosam maxime praesentium natus. Tempore fuga perferendis nesciunt delectus debitis. Ea cumque facilis animi corrupti voluptatum odio. Soluta dolor minima quibusdam rem eius voluptatum dignissimos quam.',
            orGroups: [],
          },
          {
            id: 'ff231eed46bced8276adcc8b',
            name: 'Carl Kovacek',
            description:
              'Maiores molestias odio sapiente. Officia deserunt numquam accusamus at quae doloribus accusamus libero autem. Molestias iusto nam voluptates sunt laborum ipsum dolor sequi. Iste sed sed ab aspernatur blanditiis.',
            orGroups: [],
          },
          {
            id: 'e62c0cb134ec365c09275c4f',
            name: 'Claire McGlynn',
            description:
              'Deleniti dolores vel quia perferendis veniam culpa vel ea explicabo. Qui a suscipit totam quidem asperiores. Occaecati sint hic magni porro autem.',
            orGroups: [],
          },
          {
            id: 'b248ba76e6a9814da950df9c',
            name: 'Nathan Runte',
            description:
              'Aspernatur ad sint labore iusto. Quas harum est sint. Tempora culpa ex. Eaque id autem aperiam harum fuga voluptatem labore. In corrupti corrupti suscipit eligendi distinctio.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '667e722ef1d9b1fa5bba328e',
      rules: [
        {
          id: 'ae0d4c2f2a4cb06f63f8c047',
          name: 'Raul Dare',
          description:
            'Doloribus saepe dolor ipsam esse ipsa illum quas qui. Similique accusantium nisi quidem. Quis quas nihil repellendus dicta fuga id amet qui.',
          orGroups: [],
        },
        {
          id: '7f4ac896c806a8e45aef8e8d',
          name: 'Sara Braun',
          description:
            'Beatae quos porro sunt. Consequatur nulla repudiandae deserunt pariatur doloremque. Quia accusamus architecto possimus in eveniet voluptates. Iure velit aperiam distinctio ratione minus saepe.',
          orGroups: [],
        },
        {
          id: '4cb2dbc7fdd6aaf189ceeeb1',
          name: 'Erma Walsh',
          description:
            'Similique tenetur eius nam reiciendis modi ad molestias nobis. Perspiciatis ad harum sed magnam. Neque eligendi asperiores et. In laborum cum quo et delectus eaque recusandae. Reprehenderit aperiam facere adipisci libero excepturi illum quisquam.',
          orGroups: [],
        },
        {
          id: 'ab828d8c17efb4d82e1a5d9c',
          name: 'Johnnie Gusikowski',
          description:
            'Rerum officia dicta earum dolorem quisquam quia quibusdam officia quae. Nam dolorem laboriosam maxime praesentium natus. Tempore fuga perferendis nesciunt delectus debitis. Ea cumque facilis animi corrupti voluptatum odio. Soluta dolor minima quibusdam rem eius voluptatum dignissimos quam.',
          orGroups: [],
        },
        {
          id: 'ff231eed46bced8276adcc8b',
          name: 'Carl Kovacek',
          description:
            'Maiores molestias odio sapiente. Officia deserunt numquam accusamus at quae doloribus accusamus libero autem. Molestias iusto nam voluptates sunt laborum ipsum dolor sequi. Iste sed sed ab aspernatur blanditiis.',
          orGroups: [],
        },
        {
          id: 'e62c0cb134ec365c09275c4f',
          name: 'Claire McGlynn',
          description:
            'Deleniti dolores vel quia perferendis veniam culpa vel ea explicabo. Qui a suscipit totam quidem asperiores. Occaecati sint hic magni porro autem.',
          orGroups: [],
        },
        {
          id: 'b248ba76e6a9814da950df9c',
          name: 'Nathan Runte',
          description:
            'Aspernatur ad sint labore iusto. Quas harum est sint. Tempora culpa ex. Eaque id autem aperiam harum fuga voluptatem labore. In corrupti corrupti suscipit eligendi distinctio.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'fdbb6d8eadde11d3bbce21d0',
    name: 'Miss Horace Gerhold',
    description:
      'Recusandae quaerat voluptate exercitationem eligendi omnis eius expedita sit. Eius praesentium eaque quidem. Doloribus totam officia. Aliquam rem eum illo sit dolor.',
    mainTable: 'Jacobs',
    versions: [
      {
        id: 'da7abfffeeda62295ea9e67f',
        rules: [
          {
            id: 'e8db850beb1f2aca7fbe441c',
            name: 'Terrell Walter',
            description:
              'Illum dolorem earum iusto quod reiciendis velit quisquam tempora. Aut aut soluta numquam quis quos.',
            orGroups: [],
          },
          {
            id: '4f0f0d2cef18fd9ae913be6a',
            name: 'Julius Dietrich',
            description:
              'Ducimus dicta vero occaecati aperiam at omnis. Occaecati repudiandae vero dicta reprehenderit eveniet rem dolorem ipsum. Unde distinctio ut accusamus consectetur iure. Blanditiis repudiandae expedita laboriosam error est. Explicabo unde non in. Laborum excepturi harum rerum saepe eligendi.',
            orGroups: [],
          },
          {
            id: '7db6daeb2d949ac8dbdfd7cb',
            name: 'Troy Moen',
            description:
              'Quisquam dolores totam totam. Nihil ipsam maiores quas. Quo culpa consequuntur reiciendis. Quo aperiam voluptas doloremque saepe debitis expedita hic. Id eveniet dolorum esse dolor maxime incidunt facilis.',
            orGroups: [],
          },
          {
            id: '04b6ebd5fbcfacf2c4517ccf',
            name: 'Lowell Rosenbaum',
            description:
              'Expedita velit et consequatur molestias doloribus nemo vel. Voluptatibus cum atque consequatur commodi doloribus rem eius possimus provident. Dicta consequatur nihil ea repellat quisquam adipisci. Dolorem ipsam quas. Tempore quidem consequatur soluta assumenda consectetur.',
            orGroups: [],
          },
          {
            id: '5dedc3d9b28471fddd8cfde2',
            name: 'Abraham Thompson',
            description:
              'Beatae omnis ipsa tenetur asperiores sed accusantium. Magnam exercitationem corporis autem optio eum.',
            orGroups: [],
          },
          {
            id: '31dead0dbc77d6d5c1bb96dc',
            name: 'Albert Gottlieb IV',
            description:
              'Eligendi blanditiis adipisci velit officiis tenetur accusantium inventore maxime. Distinctio quasi asperiores optio deserunt repellat. Suscipit impedit eligendi fugiat laudantium ex ex voluptatibus accusantium placeat. Ducimus assumenda rerum reiciendis officia et fuga corrupti cum excepturi.',
            orGroups: [],
          },
          {
            id: '77ada7b6cbb4117de2ead32a',
            name: 'Alton Pagac',
            description:
              'Dolores aliquam totam eius commodi mollitia magni nostrum. Nisi illum nisi aperiam optio. A aut enim repellendus sed eos.',
            orGroups: [],
          },
          {
            id: 'cae5bf24e16c80cbba140fd3',
            name: 'Alfredo Jast',
            description:
              'Excepturi dignissimos officiis labore iure recusandae. Necessitatibus sequi dignissimos consectetur provident nulla debitis autem eligendi explicabo. Ratione magni deleniti nobis. Quasi suscipit voluptate eius enim. Sed quia aut dolor maiores. Fugit dolor ullam necessitatibus sunt quia nobis minima.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ed4b4ebb5fa440b04c55ddd0',
        rules: [
          {
            id: '1a8a8caffb2fd1cce6d7f656',
            name: 'Dr. Stephen Dooley Jr.',
            description:
              'Quas exercitationem exercitationem quos. Beatae molestiae voluptatem aliquid. Rerum est nulla repudiandae dicta cum rem quibusdam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '68bced3cf5e748b45c7c5766',
        rules: [
          {
            id: '300fc9c2ce3acad28230e135',
            name: 'Angelina Hudson',
            description:
              'Cupiditate porro repellat. Quaerat impedit mollitia temporibus. Quod animi quaerat ipsum quia omnis. Minus molestiae sequi distinctio. Vel velit fuga aut. Repudiandae occaecati quod eaque earum libero.',
            orGroups: [],
          },
          {
            id: 'b61afabf8f58ab7acbdacda0',
            name: 'Pat Hills',
            description:
              'Labore aperiam amet neque officia. Facilis libero reiciendis vitae eos officiis dolore dolor ex. Voluptatem rerum omnis vitae molestiae voluptatibus hic dolorum asperiores ea. Minus reiciendis sapiente repudiandae rem.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8fe5e87819e5c33dbce35068',
        rules: [
          {
            id: '8ddcd409c3aff3b0ba2e40c9',
            name: 'Lauren Krajcik',
            description: 'Quidem illum impedit. Recusandae numquam laboriosam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '62a30ab0ccf7aa3e765e020f',
        rules: [
          {
            id: '3ddcc05cfafccb4bdacad0ff',
            name: 'Sheldon Gusikowski',
            description:
              'Optio explicabo adipisci optio vero delectus quo sint sint. Eum blanditiis nihil. Sequi quas dignissimos eos ipsa repellat nobis numquam. Ipsam voluptas pariatur error optio reiciendis. Ut perferendis fugiat harum beatae maiores neque.',
            orGroups: [],
          },
          {
            id: 'c4aa6b318caae9bcbeeece18',
            name: 'Wilma Wuckert',
            description:
              'Fuga explicabo rem asperiores consectetur vero. Earum distinctio rem suscipit ducimus ducimus voluptate. Beatae accusantium ipsam nesciunt laboriosam.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'db33e6e8deeb7daa2a16657a',
        rules: [
          {
            id: '5ba5ea7759a4958aeb3b2fd4',
            name: 'Miss Shawn Heller MD',
            description:
              'Asperiores pariatur magnam consequuntur quo harum vel consequuntur. Neque sunt aliquid doloribus aliquam enim pariatur quam. Dignissimos nisi corporis ad est quasi adipisci eius et.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'db33e6e8deeb7daa2a16657a',
      rules: [
        {
          id: '5ba5ea7759a4958aeb3b2fd4',
          name: 'Miss Shawn Heller MD',
          description:
            'Asperiores pariatur magnam consequuntur quo harum vel consequuntur. Neque sunt aliquid doloribus aliquam enim pariatur quam. Dignissimos nisi corporis ad est quasi adipisci eius et.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '6ceb235d198fe8e440c511ff',
    name: 'Jessie Hauck',
    description:
      'Nemo voluptatibus magni eius quaerat nam tenetur. Ipsum quaerat fuga. Laborum pariatur optio error vel voluptate ipsa inventore et error. Nesciunt nobis illum repellat tempore sequi suscipit eos illo. Esse delectus adipisci quam.',
    mainTable: 'VonRueden',
    versions: [
      {
        id: '9a523d40cfc2ae474ad1af5a',
        rules: [
          {
            id: '0c4afd0aafcfc21bcaa4beac',
            name: 'Barry Runolfsdottir III',
            description:
              'Sit provident sint. Quod totam laborum saepe earum officia debitis laudantium. Quaerat fugiat sint excepturi mollitia vero ut iste illum. Itaque pariatur unde quibusdam quam dolore cumque rerum autem. Porro quis minima ducimus cum perspiciatis. Quidem alias est corporis non provident beatae quam neque.',
            orGroups: [],
          },
          {
            id: 'bcbe8e837dbdeda65a162bbb',
            name: 'Rene Goodwin',
            description:
              'Praesentium adipisci laborum optio laudantium similique ex. Eos veniam amet eius magnam praesentium velit doloremque ipsum odit.',
            orGroups: [],
          },
          {
            id: 'ebd71d19882d4afbc3eee1c6',
            name: 'Cody Witting',
            description:
              'Repellat dolor quaerat beatae aliquid harum alias ad totam. Delectus molestiae ipsa. Commodi libero tenetur sunt animi id. Facere ex aperiam minima nesciunt quos incidunt fugit. Repudiandae officia aut.',
            orGroups: [],
          },
          {
            id: 'c5597cc71cd5939efbe30fde',
            name: 'Terrance Marvin',
            description:
              'Reiciendis assumenda praesentium. Aliquam excepturi blanditiis. Voluptatem provident maiores doloremque harum nostrum. Odit delectus officiis doloremque cupiditate ab.',
            orGroups: [],
          },
          {
            id: 'e98ad97ef8cad5689ab7fc7c',
            name: 'Brad Bechtelar',
            description:
              'Optio fugiat libero eligendi suscipit. Saepe consectetur possimus voluptatum occaecati at repellat. Ducimus nihil culpa in explicabo eum placeat quaerat ipsa provident.',
            orGroups: [],
          },
          {
            id: 'dbece37db1683ebeac79cc7b',
            name: 'Brooke Witting',
            description:
              'Ratione non totam alias pariatur. Voluptate ad nostrum molestias tenetur a cum exercitationem mollitia mollitia. Possimus ab sed reprehenderit eum dolores ratione inventore quasi quia. Repudiandae animi quidem nemo totam ipsum sapiente. Corporis unde quod illum beatae excepturi.',
            orGroups: [],
          },
          {
            id: 'a5e353dcbb97be7abc4709ef',
            name: 'Bruce Farrell',
            description:
              'Consectetur reprehenderit molestiae consectetur delectus possimus necessitatibus nemo ex. Earum maiores sapiente culpa eius iure.',
            orGroups: [],
          },
          {
            id: '393a04fac116bca89fc2edc5',
            name: 'Tina Pagac',
            description:
              'Eos sed a quos rem dolores accusantium. Vero quidem ipsum. Magni hic doloremque ducimus odio amet accusantium facere. Dicta ut quidem ipsam quas fuga possimus illum harum explicabo. Hic possimus officiis cupiditate.',
            orGroups: [],
          },
          {
            id: '2fbf4806fecbee6dc6efa691',
            name: 'Muriel Green',
            description:
              'Beatae et sequi animi. Sint molestias nesciunt sed nulla accusantium. Nam nam dolor praesentium facilis. Ipsam alias quae eos enim soluta suscipit tempore est. Fuga iusto cumque et suscipit voluptas porro totam ullam provident. Assumenda maxime at enim blanditiis nisi itaque maxime.',
            orGroups: [],
          },
        ],
      },
      {
        id: '9fe3cf7edc54abcce2100e49',
        rules: [
          {
            id: 'ed164fe03c9daa79ece229bb',
            name: 'Valerie Wunsch',
            description:
              'Perferendis voluptas ullam sint sed aut quasi nobis. Reprehenderit incidunt eveniet harum qui minus beatae impedit inventore. Dolorum illum quaerat. In sequi sequi. Voluptate nisi inventore ex aliquid. Aperiam modi magnam.',
            orGroups: [],
          },
          {
            id: '7f6efc9362df8fb5353dad5e',
            name: 'Vera Bechtelar',
            description:
              'Quis deleniti mollitia voluptatem velit. Porro voluptatum quidem. Non ratione nesciunt dicta error necessitatibus laboriosam distinctio esse. Illum animi cupiditate cumque error quod in alias. Libero necessitatibus nesciunt omnis odit provident sequi ducimus. Neque explicabo perferendis.',
            orGroups: [],
          },
          {
            id: 'b5caeba193b81d8be914ad88',
            name: 'Rex Bechtelar',
            description:
              'Cupiditate quod eligendi. Rerum repellendus nesciunt quae debitis iure.',
            orGroups: [],
          },
          {
            id: 'cdbcfeeafb1fbeb1def41f43',
            name: 'Debra Prohaska',
            description:
              'Eaque laborum eaque dolores sapiente pariatur magnam. Ullam repellendus voluptatibus temporibus totam itaque sunt quod nihil.',
            orGroups: [],
          },
          {
            id: 'bcf939c5dbcdf02eba4a2ab6',
            name: 'Matt Schultz',
            description:
              'In corporis eveniet earum tempora. Quibusdam dicta saepe eligendi aut tempora cum. Illum nisi voluptatibus eos. Perferendis nostrum quis ratione recusandae id quo maiores doloribus quibusdam. Eius iusto inventore accusamus sequi sint voluptatibus sequi veniam. Animi minus commodi amet alias dignissimos ipsa doloribus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '1fc315af4a952b8b0d5c7dfa',
        rules: [
          {
            id: 'd9ae5ce9aada3fcdf12f4408',
            name: 'Samuel Steuber DDS',
            description:
              'Dolorum quas commodi possimus pariatur saepe repellendus perspiciatis placeat soluta. Quidem doloribus commodi accusantium culpa adipisci quas totam at quas. Maiores aliquam modi distinctio laudantium voluptatibus. Possimus odio ipsam alias sit laudantium nostrum magni molestiae debitis. Dolore doloremque illo recusandae at. Quidem dignissimos vero laborum recusandae eum officiis exercitationem.',
            orGroups: [],
          },
          {
            id: '935fb30ec3d0c6dd722eb30f',
            name: 'Kate Runolfsdottir',
            description:
              'Explicabo dignissimos deleniti labore quaerat pariatur aspernatur. Ex expedita similique dolore labore magnam.',
            orGroups: [],
          },
          {
            id: 'b4f8d5c0cf1ec67ecdbc0bfa',
            name: 'Dianna Lebsack',
            description:
              'Quo voluptate tempora accusantium porro. Iusto voluptas nihil quam veritatis quis. Quaerat cumque explicabo voluptatum facere in dolorem commodi. Explicabo minima nam sunt aspernatur eveniet veniam aliquid. Neque eligendi blanditiis ullam.',
            orGroups: [],
          },
          {
            id: 'b8cedf92ff9fec058369efbd',
            name: 'Kathy Schmeler',
            description:
              'Quasi debitis at repellat. Id vero ex tempora nulla debitis. Dolore aperiam optio excepturi iure.',
            orGroups: [],
          },
          {
            id: '05da279c8b2b3aea047eacb4',
            name: 'Jeffery Wisoky',
            description:
              'Ab delectus cum dolorem cumque distinctio magni. Consequatur quisquam error enim architecto similique deserunt dolores. Expedita beatae vel eaque harum alias architecto expedita eum. Inventore amet repellendus. Minus consequuntur quibusdam nobis commodi in praesentium. Placeat reiciendis sequi laudantium fugiat.',
            orGroups: [],
          },
          {
            id: '6ae266a2422fcae5adfdebb7',
            name: 'Claire Kunde',
            description:
              'Fuga maiores distinctio. Hic dignissimos voluptate quasi corrupti ea. Alias similique aliquam ullam iure. Qui officiis voluptatem accusantium numquam veniam exercitationem soluta debitis hic.',
            orGroups: [],
          },
          {
            id: '9897cbb9df97faebb66f9f9b',
            name: 'Faye Weber',
            description:
              'Eos repudiandae aspernatur. Ullam minima praesentium eius.',
            orGroups: [],
          },
          {
            id: 'bf0ed7075d2d919b427edecc',
            name: 'Glenda Wisoky',
            description:
              'Id odio aliquid ducimus quam non architecto. Aperiam ad eius. Molestiae repudiandae repellat voluptate nostrum vitae.',
            orGroups: [],
          },
          {
            id: 'c8597adc1fe4bc0c8bbfa25e',
            name: 'Ramon Robel',
            description:
              'Nostrum non esse earum molestias deserunt voluptatum libero molestias. Quae dicta eveniet recusandae. Quas animi quos adipisci ipsum quae saepe iusto. Vitae error dolor omnis natus cumque. Fuga quia voluptates iure dolor. Ad sequi tenetur quam fugiat temporibus laboriosam maxime delectus explicabo.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'd45fdc2f2e13a7cec0a46fb2',
        rules: [
          {
            id: '18febc3b1d56dcc6f7028bbb',
            name: 'Nicolas Gibson DDS',
            description:
              'Numquam labore repudiandae officiis deserunt nam minima. Delectus fuga voluptas exercitationem eaque commodi quam unde at ex. Vitae iusto repellat. Accusantium fuga consectetur quis commodi mollitia reprehenderit libero molestias. Corporis cum pariatur adipisci quaerat.',
            orGroups: [],
          },
          {
            id: '1b88cbfcafc5c0bdafecdeba',
            name: 'Darryl Veum',
            description:
              'Asperiores occaecati placeat tempora dicta. Dolores doloremque reiciendis illo assumenda quasi maxime ab vero quas. Dolorum ducimus nisi praesentium.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ceceabcd24ac20bcd90ef2d0',
        rules: [
          {
            id: '4bbfe1a4b8e58efe3ce692ee',
            name: 'Mr. Hubert Dach',
            description:
              'Praesentium tempora eius esse nulla. Corrupti repellendus fugit eius a minus.',
            orGroups: [],
          },
          {
            id: 'b5aaeb1a059690e60fffc8bc',
            name: 'Mr. Shane Beatty',
            description:
              'Distinctio illum sunt corporis ipsum repellat quidem. Autem dolorum fugit esse neque laboriosam. Ea quasi minima nulla amet iure. Quibusdam animi porro ea ipsum delectus voluptates.',
            orGroups: [],
          },
          {
            id: '45acf2ba64a0ea30ea80a3fc',
            name: 'Mr. Christine Ruecker',
            description:
              'Labore nulla culpa asperiores. Ut modi numquam reprehenderit quia cum. Corrupti odit doloribus at voluptates molestiae fugit excepturi. Fugit minima a quisquam. Illo id officiis corporis quos laudantium eveniet adipisci.',
            orGroups: [],
          },
          {
            id: 'fc1beb1c6bba92b4bb7db676',
            name: 'Andrea Torphy',
            description:
              'Consequatur eaque repellendus aliquid quasi officia doloribus quod. Saepe nihil dolorum dolorum.',
            orGroups: [],
          },
          {
            id: 'b936e44fb2a454fc1e754f7d',
            name: 'Jenna Effertz V',
            description:
              'Eaque error at quod laborum inventore. Impedit temporibus at rem excepturi totam dolorum ut. Vero velit dolor libero impedit reprehenderit.',
            orGroups: [],
          },
          {
            id: '5a4e4c7de55f0dbe5babd758',
            name: 'Lamar Buckridge V',
            description:
              'Commodi accusantium aliquid rem inventore. Aliquam optio ipsa nihil enim ipsam architecto maiores quam. Iusto similique ipsa labore. Voluptatum neque adipisci dignissimos dolorum.',
            orGroups: [],
          },
          {
            id: 'b229f17deaaaa6dfd8a34d9a',
            name: 'Alvin Waters',
            description:
              'Saepe cupiditate ipsa dolorem ullam iure cupiditate ab. Temporibus illo nihil eius a unde dolorum quae sapiente. Sapiente dolores ad porro temporibus. Non iste eum necessitatibus placeat.',
            orGroups: [],
          },
          {
            id: '9ee403bdbd8fc7cc117e77fb',
            name: 'Bruce Homenick',
            description:
              'Itaque laudantium dolorum illo repudiandae. Nostrum iste perspiciatis. Sapiente laudantium repudiandae dolore expedita.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f896e1b6f026c97143cdd466',
        rules: [
          {
            id: '98e205fe3fbcd099ce95fa57',
            name: 'Elvira Bins',
            description:
              'Unde fugiat ad. Placeat beatae harum. Dolorem aspernatur perferendis ipsum tenetur maiores quidem officia exercitationem. Cum fugit aspernatur unde ratione magnam fugit rem corrupti excepturi.',
            orGroups: [],
          },
          {
            id: '39e2b7a24bbcb10eabf0af03',
            name: 'Elizabeth McGlynn',
            description:
              'Tempora odit ex molestiae odit quasi quae. Consequatur minus deserunt hic ipsum. Iusto esse voluptas incidunt. Dolor vitae nisi accusamus accusantium voluptatem excepturi voluptatibus. Repellat optio soluta hic est mollitia assumenda quaerat nostrum recusandae.',
            orGroups: [],
          },
          {
            id: 'c2eb2edf32bdde0702334bfa',
            name: 'Dr. Bert Wolf',
            description:
              'A maiores repudiandae veritatis. Veritatis ratione veritatis pariatur aspernatur libero similique cumque. Ad vel temporibus aut. Provident perspiciatis voluptatum voluptas iure. Vitae eius debitis totam vero atque.',
            orGroups: [],
          },
          {
            id: 'ec00fc6cb9aa9d584fdb21ff',
            name: 'Jesus Huels III',
            description:
              'Autem dolor molestias explicabo dignissimos repellendus possimus dolorem molestias libero. Cum repellendus cumque laborum sed voluptas animi expedita modi voluptas.',
            orGroups: [],
          },
          {
            id: '5dc91ddeb88bad311bc7a149',
            name: 'Marie Russel',
            description:
              'Officia dolor tempore rem adipisci ad perferendis iste. Assumenda aliquam optio facere. Animi ab tempore voluptatibus aliquid perferendis. Pariatur sed veniam doloremque similique qui quia voluptatibus laudantium. Consequuntur laborum vitae. Deleniti corrupti quidem magni voluptatum.',
            orGroups: [],
          },
          {
            id: '61a273a005a26b1ddb2cdcbd',
            name: 'Chester Willms',
            description:
              'Nisi nisi ex harum natus maiores aliquam. Et quaerat consequuntur harum eius consectetur magni.',
            orGroups: [],
          },
          {
            id: '4398d8ffdd7193e97075e83c',
            name: 'Andres Dicki',
            description:
              'Delectus dolore voluptatibus possimus tenetur corporis quam. Veniam asperiores non rerum commodi. Velit commodi nulla velit distinctio quo. Culpa animi possimus fugit nobis voluptatem. Aperiam ipsum repudiandae perspiciatis consectetur quas quidem vitae error.',
            orGroups: [],
          },
          {
            id: 'e9e5a85bd7ae6df7a25da11b',
            name: 'Ray Lind',
            description:
              'Error repellat vel quod. Tempore repellendus saepe eveniet amet minima placeat dicta dolor rem. Quam doloremque odio tenetur nisi eveniet exercitationem aliquid. Quibusdam quae iste excepturi accusamus totam cum nisi distinctio nihil. Eius magnam eligendi a neque. Perspiciatis nostrum corrupti.',
            orGroups: [],
          },
          {
            id: 'd7dc7061ca1eba0b2baae5e3',
            name: 'Bernice Casper',
            description:
              'Reprehenderit beatae deleniti vel omnis expedita distinctio. Perferendis sit ex occaecati qui nostrum facere culpa nesciunt sequi.',
            orGroups: [],
          },
        ],
      },
      {
        id: '7e7cb461647becd4fefdcf32',
        rules: [
          {
            id: '8d2cf467a59f9704ce34ba6a',
            name: 'Dave Casper',
            description:
              'Consequuntur veniam nulla excepturi vel. Repellat modi molestias amet asperiores distinctio excepturi magni. Nam ratione quia doloremque similique. Numquam dignissimos dolorem delectus inventore ratione incidunt eos voluptate laborum. Aliquid harum unde officiis beatae vitae.',
            orGroups: [],
          },
          {
            id: 'd7fcef8d456ee23dabbc6ee5',
            name: 'Dr. Malcolm Cormier',
            description:
              'Assumenda eligendi in quos sed. Asperiores explicabo debitis occaecati repudiandae ea repellendus laudantium. Earum perspiciatis soluta corrupti maiores doloribus soluta. In tenetur reiciendis deleniti molestias similique accusantium error exercitationem accusamus.',
            orGroups: [],
          },
          {
            id: 'fd6e5bed34d5d82219296870',
            name: 'Billie Weimann',
            description:
              'Nemo numquam voluptatem ab facilis voluptas error provident reprehenderit. Impedit nihil et delectus. Odit exercitationem sit dolor debitis. At suscipit distinctio eos dolores labore. Perferendis ad ratione corporis illum qui quibusdam quis voluptas hic. Libero rerum ratione voluptate sed.',
            orGroups: [],
          },
          {
            id: '82a67ebb96b644eca246cf9a',
            name: 'Alfonso Hudson',
            description:
              'Dolor distinctio expedita quod quae. Aut voluptatum velit reiciendis. Hic ducimus ducimus.',
            orGroups: [],
          },
          {
            id: 'b930d907e7ec1de7fc5eaade',
            name: 'Melanie Walter Jr.',
            description:
              'Tempore commodi cupiditate necessitatibus magnam minima autem a reiciendis. Possimus ullam sequi possimus nisi sequi quisquam consequatur. Quae laborum vitae minima qui explicabo nulla sed ipsum. Illum natus iste animi consectetur.',
            orGroups: [],
          },
          {
            id: 'aa75ba6786d6c87de0e768b2',
            name: 'Dr. Mary Metz',
            description:
              'Similique maxime atque eum a quasi placeat animi beatae. Quod sequi voluptates nulla totam excepturi perferendis inventore provident. Animi cumque eaque optio neque minus. Ex itaque maxime.',
            orGroups: [],
          },
          {
            id: 'daac53d7ecd7eaaedc7c6c5f',
            name: 'Lola Lowe',
            description:
              'Facilis laudantium iure labore sed unde aperiam eos earum vel. Dolores asperiores quae numquam placeat maiores dicta. Ut minima fugiat sed voluptate occaecati beatae vel animi. Quod debitis ipsam voluptate placeat a quae temporibus fugiat. Velit sequi autem accusantium est eos accusamus delectus veritatis quas. Minus consequatur a ut numquam.',
            orGroups: [],
          },
          {
            id: 'df3fd9ebd53eea005b5e31b0',
            name: 'Olga Sipes',
            description:
              'Blanditiis tempora nemo veritatis officiis qui nisi error vero. Cumque excepturi in officia quos repellendus rerum excepturi. Harum repellat incidunt. Minima quaerat quod maxime qui blanditiis ducimus. Ratione qui inventore fugit commodi sint. Itaque modi molestiae dolore voluptas maiores maiores nesciunt labore natus.',
            orGroups: [],
          },
        ],
      },
      {
        id: '3e1dc46989aed8620fc0939c',
        rules: [
          {
            id: 'aecbe2aaf6bc835a0afce8fd',
            name: 'Thelma Stroman',
            description:
              'Fugiat tempore sint at. Quaerat sapiente ullam facere quis doloremque. Id pariatur voluptatibus autem. Cupiditate minus iste iure tempore minus. Veritatis ipsa reprehenderit cumque nulla inventore animi laboriosam vel voluptates. Error suscipit porro explicabo suscipit rem.',
            orGroups: [],
          },
          {
            id: '64fb44ecd602aabb23ffe811',
            name: 'Opal Little',
            description:
              'Explicabo ipsam nobis vero. Doloremque assumenda sit eveniet ad quo doloribus.',
            orGroups: [],
          },
          {
            id: 'c60d4f4ca2c9df06dca102d1',
            name: 'Sophie Rempel',
            description:
              'Maiores mollitia quia blanditiis eaque ratione. Minima repellendus assumenda officiis saepe eius accusantium. Consequatur quidem velit voluptatem.',
            orGroups: [],
          },
          {
            id: 'ead10b9ee5ab4b04de95e12d',
            name: 'Carmen Berge',
            description:
              'Debitis ea corporis recusandae perspiciatis fuga nisi at neque dolorum. Dolores blanditiis iste cumque praesentium hic. Natus quos aliquam illum nostrum error porro eius at. Architecto rem inventore soluta doloremque.',
            orGroups: [],
          },
          {
            id: 'd71ab8d508e8d0c82ae1193d',
            name: 'Heather Gerlach',
            description:
              'Molestias labore voluptas sed. Eius qui magnam veritatis labore delectus magnam voluptatem dicta accusantium. Tenetur recusandae doloribus a tempora eos dolor molestias mollitia voluptate. Pariatur consequatur enim. Ad vitae omnis ad rerum quas quis ab.',
            orGroups: [],
          },
          {
            id: 'e8af2fc34229e2c6aeb3d17c',
            name: 'Guadalupe Leuschke',
            description:
              'Maxime expedita possimus cum quia. Aperiam unde magni cum quam consectetur saepe. Facere ad ab veritatis. Similique explicabo quia voluptatem. Cum exercitationem natus ea asperiores cupiditate id vitae.',
            orGroups: [],
          },
          {
            id: '2be35cf7ba50dba0ebeb0974',
            name: 'Viola Steuber',
            description:
              'Nesciunt labore ipsam cupiditate quasi eos qui accusamus labore eaque. Assumenda incidunt modi officia soluta omnis eos voluptatibus doloremque. Iste reiciendis nihil consectetur impedit delectus debitis voluptatibus alias alias. Molestiae ipsum ea placeat necessitatibus distinctio delectus doloremque optio. Sapiente suscipit accusamus quae facilis quaerat. Quaerat nobis commodi assumenda doloribus.',
            orGroups: [],
          },
          {
            id: '15666af3a3e6f131cf5b5aeb',
            name: 'Edgar Rogahn',
            description:
              'Nihil ipsum accusantium modi iusto sed consequatur cum occaecati quibusdam. Ullam nisi officiis. Harum sed adipisci aliquam reprehenderit numquam autem. In ducimus odit quos. Ratione commodi esse. Quibusdam velit nesciunt labore mollitia perspiciatis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c8bbaf2b2f595fef1ca4b61d',
        rules: [
          {
            id: 'af9bf5a2eeae3cf1a1b4d91a',
            name: 'Derrick Rippin',
            description:
              'Asperiores itaque est pariatur quibusdam quia consequatur. Hic vitae dolorem quis ipsa necessitatibus tempore. Eveniet quisquam suscipit repellat itaque recusandae. Illo id id reprehenderit omnis inventore.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'c8bbaf2b2f595fef1ca4b61d',
      rules: [
        {
          id: 'af9bf5a2eeae3cf1a1b4d91a',
          name: 'Derrick Rippin',
          description:
            'Asperiores itaque est pariatur quibusdam quia consequatur. Hic vitae dolorem quis ipsa necessitatibus tempore. Eveniet quisquam suscipit repellat itaque recusandae. Illo id id reprehenderit omnis inventore.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '7bfffcd4a1b8ba4f15d21fdf',
    name: 'Joshua Mertz',
    description:
      'Est quis ea explicabo molestiae commodi deleniti. Libero a repellendus quam expedita ea alias ex eaque. Iure eligendi porro voluptates id dolorem reprehenderit sit molestiae repellendus. Vel non animi corrupti dolorem accusantium. Cupiditate ducimus excepturi laboriosam quia rerum aperiam officia necessitatibus occaecati.',
    mainTable: 'Blanda',
    versions: [
      {
        id: 'ba9db85e2b2d7babddd331a4',
        rules: [
          {
            id: '3dc5fc2cbf06b0fdc4c6e2b6',
            name: 'Mattie Rowe',
            description:
              'Voluptas iure enim. Molestias accusantium fuga neque excepturi a. Inventore vero in nisi.',
            orGroups: [],
          },
          {
            id: 'cb2b5cd41facf52535d7c39f',
            name: 'Terri Yundt',
            description:
              'Est illo dicta nihil a a minima accusamus. Quos sint consequuntur voluptatem consequuntur laboriosam voluptatum officia placeat. Tempora eos repellat delectus consequatur animi. Nostrum laudantium non atque consectetur possimus inventore eaque. Incidunt ipsa nihil excepturi labore facilis.',
            orGroups: [],
          },
          {
            id: '54fbe4549fceb05a1dd0daac',
            name: 'Zachary Thiel',
            description:
              'Ducimus facere nostrum ex cumque ab ipsa perferendis. Reiciendis fugiat cumque esse itaque blanditiis recusandae eum similique.',
            orGroups: [],
          },
          {
            id: 'e749ddda650a03c063dfc706',
            name: 'Mr. Joanne Legros',
            description:
              'Repudiandae qui quam inventore odit. Molestiae aspernatur animi placeat. Perferendis est numquam quasi. Non hic expedita rerum officia tenetur veritatis ad vero placeat. Vitae placeat at recusandae voluptatum facilis tenetur at molestiae error. Veritatis expedita tempora in quis illum non veniam at neque.',
            orGroups: [],
          },
          {
            id: 'fbfb78ef897ffcdcc977b5c6',
            name: 'Peggy Crist',
            description:
              'Quos deserunt nulla amet. Expedita accusamus ipsum qui dicta. Vitae aut nostrum. Placeat natus ullam similique aspernatur explicabo alias aperiam. Ipsam quia deserunt. Beatae exercitationem deleniti saepe eaque repudiandae facere.',
            orGroups: [],
          },
          {
            id: 'b2cfe0cc369257c8744badaf',
            name: 'Regina Herzog',
            description:
              'Cupiditate eligendi ab reprehenderit doloremque perspiciatis. Rerum asperiores exercitationem eius dicta. Ex temporibus voluptatibus tempore veniam ipsum porro molestiae eius ea.',
            orGroups: [],
          },
          {
            id: 'dc9329bc5c0df1bcb60ce74a',
            name: 'Antoinette Erdman',
            description:
              'Non numquam veritatis. Voluptas beatae quae animi minus magni nam quos quidem. Ab nemo illum nihil dolore ad. Asperiores rem ab ex dicta rem velit accusantium expedita et.',
            orGroups: [],
          },
          {
            id: 'ffaee98fed8b53f717ca41ea',
            name: 'Monique Price',
            description:
              'Quod beatae deleniti tempora ea corrupti rerum eos perspiciatis. Vero recusandae ratione provident facilis omnis tempore illo neque voluptates. Nam quae neque earum similique incidunt a tempora itaque.',
            orGroups: [],
          },
          {
            id: '87cad082f3ecab3e98e0b63f',
            name: 'Ms. Arturo Tromp',
            description:
              'Aliquid quasi inventore reprehenderit natus enim quidem tenetur ipsa ullam. Ab nostrum rem ipsam soluta mollitia. Ducimus iure sint amet exercitationem deserunt. Totam similique necessitatibus eius ad. Vero unde ullam vel placeat.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'a3eb565da0f6b0336355338f',
        rules: [
          {
            id: 'f123f9f2fb1965b9db7dc52b',
            name: 'Guadalupe Willms',
            description:
              'Vero cumque aliquid. Nihil impedit mollitia consequatur pariatur quo magnam. Eum saepe earum ipsum.',
            orGroups: [],
          },
          {
            id: '10f30fab4965eb01eebc228c',
            name: 'Archie Renner',
            description:
              'Pariatur laboriosam maiores reprehenderit. Non commodi quis. Voluptate reiciendis provident rerum delectus labore fuga at nihil fuga. Doloribus unde dolor maiores. Veritatis ea ab dolores dolor reiciendis magni. Occaecati optio veniam consequuntur.',
            orGroups: [],
          },
          {
            id: 'd37efeb6af349b95caef1782',
            name: 'Sarah Walter',
            description:
              'Dignissimos aperiam ullam dolor dolor nam dolorem vero autem deserunt. Suscipit unde laudantium voluptatibus neque rerum provident inventore sapiente repellat.',
            orGroups: [],
          },
          {
            id: 'ab0c6801abbbcbec093ecbbc',
            name: 'Ollie Turcotte',
            description:
              'Aut libero nisi assumenda dolore consequatur optio necessitatibus fugiat. Veniam omnis nesciunt deleniti veritatis accusantium magnam dolorem laudantium.',
            orGroups: [],
          },
          {
            id: '6daf7e35ca2477b8fef8b2ba',
            name: 'Dominick Rolfson',
            description:
              'Vero incidunt vel quaerat aperiam. Corrupti quaerat nemo illo unde dolorem maiores sit quae. Saepe in in reprehenderit distinctio. Eos minima unde aspernatur. Quod quidem similique voluptate sapiente minima illo occaecati recusandae iure.',
            orGroups: [],
          },
        ],
      },
      {
        id: '666dc9b6685cab5acfdba6ac',
        rules: [
          {
            id: '4dfba106efaeb7ca9af4bf04',
            name: 'Herbert Hyatt',
            description:
              'Placeat minus animi. Illo deleniti iure assumenda adipisci exercitationem. Quas voluptatibus culpa repellat ratione eius cum. Qui provident a tenetur pariatur quasi vitae. Dolores ea repudiandae consectetur repellat accusamus unde harum officia.',
            orGroups: [],
          },
          {
            id: '9f3d4f0c0d47faa5fcf74569',
            name: 'Daryl Konopelski',
            description:
              'Ea a ratione. Ex quam ad fugiat minus pariatur sed maxime quaerat maxime. Laboriosam soluta repellat odio eius velit sint. Odit incidunt tempore vitae.',
            orGroups: [],
          },
          {
            id: 'dadf11d9ca6a9e2fb3ce3eaf',
            name: 'Mrs. Dominic Kemmer',
            description:
              'Veritatis nesciunt sunt dolores. Fugiat quas cum provident explicabo autem ad sint eveniet. Perspiciatis ab natus.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'dcbead57b0b326bed7d656c4',
        rules: [
          {
            id: 'ced3cdaa64941e8e6b7dfaf6',
            name: 'Genevieve Harvey II',
            description:
              'Deleniti dolores optio aspernatur aspernatur non natus. Quis quod temporibus. Ipsam delectus quasi non. Aspernatur vero aliquid sunt quasi illo. Veniam consequuntur consectetur ducimus cupiditate inventore culpa quae facilis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c977e0832cb4ec05aa53e2fc',
        rules: [
          {
            id: '46a8aa9c3f9e10bc65f7cbb3',
            name: 'Renee Bode',
            description:
              'Voluptatem dignissimos enim vero tempore. Pariatur voluptas molestiae nisi deserunt nostrum eligendi. Praesentium harum similique nostrum nulla fuga in ratione distinctio et. Voluptatum totam necessitatibus eveniet fugit sed expedita aliquam. Molestiae corporis maiores neque. Repellat ullam ipsa culpa in iusto exercitationem distinctio fugiat voluptate.',
            orGroups: [],
          },
          {
            id: '873aadaa6c7c3f14d77260eb',
            name: 'Ramon Satterfield',
            description:
              'Ipsam ratione voluptas. Non maiores eligendi. Dolores molestiae aliquid deleniti.',
            orGroups: [],
          },
          {
            id: 'b8dfc93c92af3cebda255a1c',
            name: 'Doyle Williamson',
            description:
              'Adipisci labore aliquid nam ex ullam eaque. Accusamus accusamus voluptatum molestias animi occaecati totam sequi facere dignissimos. Pariatur voluptatibus doloremque similique occaecati delectus repellat ea dignissimos. Deserunt est saepe delectus aut rem eius praesentium.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'e2c942cf1fa4be7071eb9d59',
        rules: [
          {
            id: '25f7c6fd8eb3cdb52d7a8c5c',
            name: 'Lila Bode',
            description:
              'Iusto nisi tempora laboriosam reprehenderit laudantium ratione aperiam natus neque. Natus perspiciatis ducimus consequatur illum officiis molestiae. Quidem non natus molestiae totam voluptatem.',
            orGroups: [],
          },
          {
            id: 'baa8fc9e5f36bca7c8ad0d18',
            name: 'Sherri Kirlin',
            description:
              'Tempora id numquam vero hic sapiente. Veritatis quam atque provident ratione ad maiores ratione quisquam minima. Ipsum odit facere.',
            orGroups: [],
          },
          {
            id: 'a709d0ac0e6ebac8ebb8e6eb',
            name: 'Earnest Hermann',
            description:
              'Odit est quia neque asperiores voluptas. Voluptas dolores tempora molestias provident id.',
            orGroups: [],
          },
          {
            id: 'aa56a1baf3a8869bd1cef6ad',
            name: 'Felipe Baumbach',
            description:
              'Omnis consectetur minus id iste amet at dolorum animi aut. Odio est impedit ad minima.',
            orGroups: [],
          },
          {
            id: '6fc1c0f945fb10da78c06dd4',
            name: 'Whitney Stamm',
            description:
              'Exercitationem omnis iusto repudiandae. Consectetur mollitia odit nihil eius magni illum laborum officiis.',
            orGroups: [],
          },
          {
            id: 'cc8dabdb54efddc76de62f9f',
            name: 'Elena Gibson DDS',
            description:
              'Pariatur earum aliquid quibusdam illum qui facere sint eos. Eligendi iste mollitia delectus perferendis explicabo. Tempore quis voluptatem facere quos optio commodi labore ipsum et.',
            orGroups: [],
          },
          {
            id: 'caf416eecc9f1ebaaffbe003',
            name: 'Mrs. Raquel Lehner',
            description:
              'Vel earum vel soluta dignissimos vel. Repellendus quasi ducimus consequuntur consectetur nulla. Ipsum magnam sequi in sunt. Repellat libero voluptatibus sequi aspernatur. Occaecati iure quaerat. Quod quos consequatur commodi sunt ad assumenda perspiciatis magnam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '22107f6f7a4d1ce3d10ddfde',
        rules: [
          {
            id: 'da21aef22beaf854f88d1c3c',
            name: 'Byron Zboncak',
            description:
              'Quibusdam eveniet ad cupiditate impedit in voluptatum. Magnam placeat similique inventore. Animi nisi totam corporis praesentium optio reiciendis.',
            orGroups: [],
          },
          {
            id: 'a8b8e7bbdce3c5c4cf5ef1ab',
            name: 'Julie Waters',
            description:
              'Possimus sapiente maxime vero cupiditate quisquam sint hic cumque non. Reprehenderit modi maxime sit quo recusandae reiciendis. Voluptatum laboriosam ab ipsa.',
            orGroups: [],
          },
          {
            id: 'dfbbab7cb9b3beaa20e16bee',
            name: 'Miss Jan Will',
            description:
              'Praesentium illum inventore animi hic culpa atque qui nisi incidunt. Aspernatur ducimus magnam. Ratione modi maxime officiis quam fugit veniam perferendis rem quasi. Exercitationem atque culpa facilis inventore rem totam unde excepturi. Totam asperiores nisi modi incidunt qui.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c7bdeff206a9aedd5128a000',
        rules: [
          {
            id: 'd0dd22b799a3afab9cb60afe',
            name: 'Peter Vandervort',
            description:
              'Eaque qui ipsum expedita maxime illo. Soluta quae beatae.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'c7bdeff206a9aedd5128a000',
      rules: [
        {
          id: 'd0dd22b799a3afab9cb60afe',
          name: 'Peter Vandervort',
          description:
            'Eaque qui ipsum expedita maxime illo. Soluta quae beatae.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: 'a2e869ab094080e9dab4690a',
    name: 'Alicia Collins',
    description:
      'Facilis sapiente ut non enim odit. Aliquam voluptas cupiditate. Aspernatur nam esse perspiciatis tempora laudantium libero. Quam totam repudiandae ullam dolore accusamus. Commodi delectus delectus maxime facere dolorum consectetur tenetur nihil esse. Dolore iure voluptate tempore autem minus.',
    mainTable: 'Douglas',
    versions: [
      {
        id: 'acdc5514bf5b16216fe689d2',
        rules: [
          {
            id: '9cc2b20bdac4f94ab4136d1d',
            name: 'Kristy Bradtke',
            description:
              'Ut et accusamus maiores dolore eum. Nisi minus ex ab saepe incidunt et dolorum vel.',
            orGroups: [],
          },
          {
            id: 'eedd6de7fcf0aea05a2139c1',
            name: 'Cameron Braun II',
            description:
              'Iusto fuga quasi voluptas nostrum rerum hic. Similique veniam doloribus earum sed illum ratione repellat omnis. Perspiciatis maxime nostrum facilis velit. Voluptatum commodi distinctio quaerat repellat. Dolorum asperiores dolorem voluptatem dicta ducimus voluptates at harum.',
            orGroups: [],
          },
          {
            id: '3dbebbfdb28bc41017b360be',
            name: 'Timmy Nikolaus',
            description:
              'Laboriosam nobis incidunt a. Est eligendi doloremque quos eveniet corporis officia odio.',
            orGroups: [],
          },
          {
            id: '2ccf65ffdaafca1de41008d6',
            name: 'Roland Corkery',
            description:
              'Recusandae voluptas neque facilis quae quasi nesciunt amet. Nesciunt iure dolore eaque rerum rerum ipsum nostrum dolorem.',
            orGroups: [],
          },
        ],
      },
      {
        id: '5a4fc76e11f6bdec069ce645',
        rules: [
          {
            id: 'c5d7d5d9b0f5cbb97b1bbc7d',
            name: 'Elaine Murray',
            description:
              'Incidunt sequi soluta hic ipsam animi omnis vel consequatur. Necessitatibus maiores quos consequatur repellat quibusdam repellendus. Placeat ipsam laboriosam consequuntur quidem ex harum odit.',
            orGroups: [],
          },
        ],
      },
      {
        id: '8e63fce0ffbdbdc1504392df',
        rules: [
          {
            id: 'bd8b2b068ceb3aff68bad1d5',
            name: 'Lydia Herzog',
            description:
              'Recusandae soluta voluptatum velit a maiores quisquam debitis repellendus non. Adipisci ex praesentium laudantium necessitatibus. Saepe ab tempore cupiditate veritatis fugit omnis labore assumenda cupiditate. Sint qui amet deleniti quas tempora natus aliquam.',
            orGroups: [],
          },
          {
            id: '5c3e64a3b40c73bbdefb7b62',
            name: 'Ms. Alberto Brown',
            description:
              'Tempora asperiores officiis distinctio numquam labore earum. Sapiente debitis reiciendis molestias nostrum occaecati ab. Velit culpa velit. Sapiente aliquam minus. Esse cupiditate recusandae. Animi corporis itaque exercitationem temporibus corporis corporis ipsa.',
            orGroups: [],
          },
          {
            id: '1afbc526d2e0cc5dd9e266d3',
            name: 'Danielle Hegmann DDS',
            description:
              'Tenetur similique nemo consequuntur officiis praesentium impedit numquam error asperiores. Debitis tempore ab illo quaerat sunt.',
            orGroups: [],
          },
          {
            id: 'acd8f020fc9790ab35a66d3b',
            name: 'Mr. Pedro Hegmann',
            description:
              'Aliquam consectetur explicabo reiciendis magni officiis porro. Repellat commodi doloremque illo rerum repudiandae error sapiente nam eum. Facilis occaecati recusandae id repellendus nulla. Nostrum eligendi repellat delectus beatae quia eius corporis. Iure voluptas consequuntur occaecati minus molestiae eaque exercitationem.',
            orGroups: [],
          },
          {
            id: 'b8ecde08ae9abaaaaca8c8c3',
            name: 'Dawn Hilll',
            description:
              'Occaecati quaerat asperiores incidunt accusamus ullam. Rerum vitae sunt laudantium odit aut nam recusandae. Dolor eum laborum ut eaque temporibus. Deserunt tenetur adipisci dolor. Eius laborum nulla itaque deserunt culpa dolorem soluta officia.',
            orGroups: [],
          },
        ],
      },
      {
        id: '556b3b6cdcacb5bbeabef73b',
        rules: [
          {
            id: 'db9c8d0fc847b0c119eed5e3',
            name: 'Wesley Hackett',
            description:
              'Facilis nihil saepe alias magnam laboriosam laudantium corrupti praesentium. Blanditiis fugit maxime. Totam sequi sapiente doloremque ut vero. Alias eaque in ducimus rerum labore in delectus illum. Dolore necessitatibus omnis.',
            orGroups: [],
          },
          {
            id: 'ab3e0b54ef9378dd07afb7df',
            name: 'Karl Carroll',
            description:
              'Reprehenderit ipsam unde vero sed. Minima a dicta perspiciatis in enim excepturi quibusdam. Ab similique amet inventore vitae magni omnis beatae at consequuntur.',
            orGroups: [],
          },
          {
            id: '6efd4ec37b2ff1badd801363',
            name: 'Pam Fisher',
            description:
              'Repellendus similique reprehenderit illum quia vel in. Optio distinctio alias iure qui nisi mollitia recusandae reiciendis.',
            orGroups: [],
          },
          {
            id: 'e120005cef57ccec6433ffea',
            name: 'Amy Maggio PhD',
            description:
              'Ab voluptas voluptas quae id cumque voluptas magni assumenda velit. Quod ducimus quas debitis voluptates. Voluptatum placeat ad minus omnis hic ipsum qui. Sit impedit quis est architecto sint iusto. Magni temporibus sit assumenda tempora esse nobis qui asperiores explicabo.',
            orGroups: [],
          },
          {
            id: 'c7b9aee9d79aeaddf75e6b04',
            name: 'Denise McGlynn',
            description:
              'Magnam reprehenderit ex quasi sit quasi error. Cumque blanditiis consequatur nulla doloremque quod qui. Sit temporibus possimus voluptatem harum eius nostrum voluptatum rerum.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'acee0beffc3224fbcad4b5c1',
        rules: [
          {
            id: 'de8ecdac5dde0062a041c0ef',
            name: 'Doyle Cronin',
            description:
              'Ipsa minima laboriosam provident autem id. Voluptatum laborum veniam blanditiis earum itaque. Illum dolores dolor explicabo eos placeat assumenda veritatis nisi voluptatibus. In dolorum dolore pariatur voluptas qui voluptate veritatis distinctio. Dolorem quod nobis nam. Necessitatibus fugit fugiat ratione illo natus ipsum ad harum.',
            orGroups: [],
          },
          {
            id: 'f2ab1072db5f1b9f82fd47dd',
            name: 'Denise Mann',
            description:
              'Culpa nesciunt natus praesentium veritatis nemo ad. Magnam ex vero fugiat quas magni rem eius. Nemo ea eveniet laudantium inventore. Repellat voluptas itaque odio doloremque. Earum voluptas sunt doloribus ipsam rem assumenda modi voluptates. Qui minus vitae occaecati laborum suscipit quia aspernatur nobis.',
            orGroups: [],
          },
          {
            id: 'ded6d40631cafab5f71d32fc',
            name: 'Angel Kiehn',
            description:
              'Debitis eaque ex optio optio sint vero laboriosam tenetur. Nostrum quam rerum. Velit laborum laborum quisquam voluptatibus inventore voluptate beatae. Nihil animi aspernatur.',
            orGroups: [],
          },
          {
            id: '4b9472e98452c96cf4db4a95',
            name: 'Wilson Ritchie',
            description:
              'Sint deserunt assumenda. Perferendis iusto dolorem molestias. Laudantium quo ipsa.',
            orGroups: [],
          },
          {
            id: 'ffc4c0e4ba358dcd45fac47a',
            name: 'Vicky Cassin',
            description:
              'Vitae doloremque aliquam distinctio nulla nemo a sed assumenda animi. Rerum ex necessitatibus quisquam. Fugiat ratione natus minima ratione quidem. Nobis dignissimos perspiciatis eum saepe sint.',
            orGroups: [],
          },
          {
            id: '94bc2f88bcf194f39681dd3d',
            name: 'Miss Stewart Jacobi',
            description:
              'Quasi amet nostrum similique sapiente nam. Dicta adipisci laborum doloribus eius inventore dolorem necessitatibus. Reiciendis totam ratione et officiis necessitatibus. Adipisci minus aperiam reprehenderit laborum. Officia quod veritatis provident reiciendis minus laborum vel nam at. Dignissimos veniam nesciunt vel libero non libero facere.',
            orGroups: [],
          },
          {
            id: 'dbe21f1bf2ece58011fba4ed',
            name: 'Sadie Kozey',
            description:
              'Numquam quas libero delectus. Ut neque voluptate quibusdam consectetur. Quisquam maxime architecto. Nemo nemo soluta. Pariatur natus culpa officia necessitatibus nam saepe ducimus nihil. Maxime impedit atque labore necessitatibus numquam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '5cbe2bb2c3acab6b3c3645bb',
        rules: [
          {
            id: '8a0f57b38a4fbba189adfba5',
            name: 'May Pacocha',
            description:
              'Animi fugit optio. Quisquam magni laborum reiciendis repellendus sint voluptates architecto quidem. Dolorem repudiandae nemo eaque ut omnis quia. Ad placeat voluptatum accusantium ullam exercitationem. Voluptatum expedita error molestiae exercitationem possimus aut libero. Architecto repellat harum aliquid incidunt molestiae ratione earum.',
            orGroups: [],
          },
          {
            id: 'b8384dac6ac0cdf2fada7294',
            name: 'Miss Teresa Borer',
            description:
              'Quo aliquam ipsum nobis iste provident. Impedit minima quaerat atque itaque exercitationem rem laboriosam aliquam odio. Voluptates odio cumque deleniti quaerat quod non sint ut. Assumenda in id dolor atque quisquam.',
            orGroups: [],
          },
        ],
      },
      {
        id: '3517963eac3bda2020f9fb0a',
        rules: [
          {
            id: '8ec647b46bbae4a0aefb041e',
            name: 'Eileen Hintz III',
            description:
              'Neque eum corrupti aut vero iusto similique soluta eveniet. Maiores molestias magni. Ut nemo blanditiis aspernatur ipsa. Voluptas voluptas quae. Modi id inventore soluta quod iste.',
            orGroups: [],
          },
          {
            id: '1edec1720f2a9e71bc1de488',
            name: 'Clinton Emmerich',
            description:
              'Iusto iusto vero ad fugit sed enim mollitia rem. Dolorem autem quaerat eveniet temporibus reiciendis hic ipsa. Quidem neque quod deleniti occaecati inventore praesentium dolorum. Quo soluta accusamus veniam facilis distinctio sunt molestiae. Ducimus aliquid delectus facilis tempore.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'faa56def2101b3dc02cdb20d',
        rules: [
          {
            id: 'ccda318b0fa5eb0ab8f6bb4b',
            name: 'Gwendolyn Hessel',
            description:
              'Cupiditate pariatur excepturi aliquam corrupti voluptatem. Officia nobis laboriosam aperiam maxime accusantium laborum. Consequuntur nobis soluta vel natus odio excepturi cum accusamus natus. Minima quas quidem asperiores. Incidunt totam quisquam officia ex eveniet dolor modi.',
            orGroups: [],
          },
          {
            id: 'decefd86ceaea9a6da59ca5d',
            name: 'Rene Rosenbaum',
            description:
              'Doloremque veritatis exercitationem atque velit ipsum. Fuga veniam amet enim in asperiores illum non.',
            orGroups: [],
          },
          {
            id: 'b7d05c0ac567a0af7d7bcef9',
            name: 'Ms. Rodney Hessel',
            description:
              'Recusandae alias exercitationem sit. Animi ea ea a id. Facilis dicta doloribus.',
            orGroups: [],
          },
          {
            id: '6accbee4e06733b5e1ba1cf1',
            name: 'Wendell Connelly',
            description:
              'Libero similique vel quis sequi ullam voluptatem numquam aliquid totam. Maiores dolorem eum. Exercitationem eos asperiores omnis id placeat modi veniam.',
            orGroups: [],
          },
          {
            id: '54cdc00ef2d6f8ccd1fe1a69',
            name: 'Ella Bogan MD',
            description:
              'Sint fuga beatae veritatis nostrum provident nam nesciunt voluptatem magni. Cupiditate reprehenderit minima quis aut doloribus ad. Odio vel at voluptatem placeat consequatur nihil. Ad aut officiis iusto.',
            orGroups: [],
          },
          {
            id: 'dc1cc6eadcff5d84cc3193e0',
            name: 'Saul Corkery Jr.',
            description:
              'Iusto neque ut quibusdam iste dolores ipsam. Cupiditate doloribus necessitatibus porro voluptates dolorem minima perferendis sunt. Recusandae sint aliquam. Praesentium quae minus amet reiciendis est. Omnis iusto animi.',
            orGroups: [],
          },
          {
            id: 'adccaa98d16f2738dcb1ece1',
            name: 'Alyssa Toy',
            description:
              'Deserunt eaque dicta totam. Perferendis accusamus culpa ut quibusdam. Praesentium optio nemo vel minima dolores provident. Eos vero libero. Necessitatibus quibusdam ab odio iure. Velit assumenda quas.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'faa56def2101b3dc02cdb20d',
      rules: [
        {
          id: 'ccda318b0fa5eb0ab8f6bb4b',
          name: 'Gwendolyn Hessel',
          description:
            'Cupiditate pariatur excepturi aliquam corrupti voluptatem. Officia nobis laboriosam aperiam maxime accusantium laborum. Consequuntur nobis soluta vel natus odio excepturi cum accusamus natus. Minima quas quidem asperiores. Incidunt totam quisquam officia ex eveniet dolor modi.',
          orGroups: [],
        },
        {
          id: 'decefd86ceaea9a6da59ca5d',
          name: 'Rene Rosenbaum',
          description:
            'Doloremque veritatis exercitationem atque velit ipsum. Fuga veniam amet enim in asperiores illum non.',
          orGroups: [],
        },
        {
          id: 'b7d05c0ac567a0af7d7bcef9',
          name: 'Ms. Rodney Hessel',
          description:
            'Recusandae alias exercitationem sit. Animi ea ea a id. Facilis dicta doloribus.',
          orGroups: [],
        },
        {
          id: '6accbee4e06733b5e1ba1cf1',
          name: 'Wendell Connelly',
          description:
            'Libero similique vel quis sequi ullam voluptatem numquam aliquid totam. Maiores dolorem eum. Exercitationem eos asperiores omnis id placeat modi veniam.',
          orGroups: [],
        },
        {
          id: '54cdc00ef2d6f8ccd1fe1a69',
          name: 'Ella Bogan MD',
          description:
            'Sint fuga beatae veritatis nostrum provident nam nesciunt voluptatem magni. Cupiditate reprehenderit minima quis aut doloribus ad. Odio vel at voluptatem placeat consequatur nihil. Ad aut officiis iusto.',
          orGroups: [],
        },
        {
          id: 'dc1cc6eadcff5d84cc3193e0',
          name: 'Saul Corkery Jr.',
          description:
            'Iusto neque ut quibusdam iste dolores ipsam. Cupiditate doloribus necessitatibus porro voluptates dolorem minima perferendis sunt. Recusandae sint aliquam. Praesentium quae minus amet reiciendis est. Omnis iusto animi.',
          orGroups: [],
        },
        {
          id: 'adccaa98d16f2738dcb1ece1',
          name: 'Alyssa Toy',
          description:
            'Deserunt eaque dicta totam. Perferendis accusamus culpa ut quibusdam. Praesentium optio nemo vel minima dolores provident. Eos vero libero. Necessitatibus quibusdam ab odio iure. Velit assumenda quas.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '159cce1a7b4346cbae7e063a',
    name: 'Carolyn Sipes',
    description:
      'Atque provident totam sequi. Eligendi modi exercitationem cumque rem consectetur recusandae. Aspernatur libero aut reprehenderit impedit doloremque aliquid asperiores iure. Exercitationem repudiandae id.',
    mainTable: 'Goyette',
    versions: [
      {
        id: '9afc91ecbc3a25849cd9eea3',
        rules: [
          {
            id: 'a4d921b0daeba142c599a5f7',
            name: 'Mr. Timmy Beahan',
            description:
              'Aliquam animi amet alias quae ducimus voluptates. Ipsum atque temporibus hic aspernatur sit at. Aperiam atque veniam. Consequuntur eligendi sit quos commodi porro. Quam inventore facilis impedit nisi. Similique distinctio repudiandae quis distinctio iusto error dicta.',
            orGroups: [],
          },
        ],
      },
      {
        id: '6caeaae1bcca7e2dfa004c00',
        rules: [
          {
            id: 'aec7e6fff71adfaf23ab6f03',
            name: 'Chad Price',
            description:
              'Laudantium tempora numquam molestias aperiam doloribus consectetur nulla laudantium tempore. Unde quisquam inventore laboriosam numquam neque sunt incidunt facere. Omnis quaerat aspernatur ea. Fugit suscipit molestias eveniet reprehenderit omnis consequatur. Itaque eveniet recusandae deserunt iure. Nihil quia officia quasi ab blanditiis laborum.',
            orGroups: [],
          },
          {
            id: 'dcad3ffaccabbe0ccbafe774',
            name: 'Bert Williamson',
            description:
              'Necessitatibus quasi in nesciunt ullam dolores animi. Neque magni dolor officia quaerat. Temporibus libero ratione rem ab facilis sed consequuntur. Optio deserunt ipsa nisi esse ratione perspiciatis distinctio eos ipsum. Fuga deleniti velit enim culpa. Totam laborum perspiciatis dignissimos quia at ratione nesciunt eum.',
            orGroups: [],
          },
          {
            id: '18b46f6fb7cbec8ba73dc637',
            name: 'Ada Bechtelar',
            description:
              'Dicta minus illum expedita dolorem hic. Temporibus ratione explicabo eligendi esse atque corporis quo.',
            orGroups: [],
          },
          {
            id: '7d7a012b8fbd19bbefbbc3ac',
            name: 'Lance Witting',
            description:
              'Adipisci nam iste ad nihil voluptatibus veniam quos. Cum facere eaque numquam possimus. Voluptatibus mollitia nam officiis reprehenderit illum sed est beatae. Excepturi excepturi voluptates officia saepe.',
            orGroups: [],
          },
          {
            id: 'dd01b1f689732517f8bfcaec',
            name: 'Courtney Mayer',
            description:
              'Numquam aperiam aliquid nihil perferendis. Dignissimos autem enim asperiores eos assumenda impedit ullam quisquam. Occaecati ut rem soluta tempora eum mollitia nulla dolore accusantium. Iste tempore beatae nisi in asperiores deleniti. Iusto in mollitia dolorum vel. Cupiditate ducimus deserunt aperiam nulla dolores.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'bf0de7528dd3fcfbf41cb4b6',
        rules: [
          {
            id: 'f1136af0a5bff13d9b31a709',
            name: 'Jay Fahey',
            description:
              'Vero dicta dolorem molestiae maxime assumenda amet labore. Et veniam dignissimos exercitationem possimus maxime vero cumque. Sint fugiat commodi soluta exercitationem.',
            orGroups: [],
          },
          {
            id: 'bd6baaaa456a7dbe80d7113d',
            name: 'Clark Homenick',
            description:
              'Numquam animi alias labore occaecati. Vel tenetur ut quisquam ipsam. Corrupti fugit voluptates quisquam hic harum dignissimos id. Quam incidunt vel. Error officia ipsa.',
            orGroups: [],
          },
          {
            id: '3acb9c61efa4536e4c3afbcc',
            name: 'Hattie Hayes IV',
            description:
              'Labore illum error enim modi delectus. Quas nihil eveniet accusantium. Eos at dolore fuga error ex ullam velit. Eligendi accusamus odio quasi suscipit error.',
            orGroups: [],
          },
          {
            id: '8aa37da9f5baa294bb46cdb2',
            name: 'Antoinette Swift',
            description:
              'Et sint nobis illo minus. Temporibus eum natus tempore. Reiciendis tempora id earum labore quisquam quaerat possimus pariatur. Placeat ipsum reprehenderit eum dicta magnam reprehenderit. Odit ab quas saepe aliquam. Vitae sint vitae quos.',
            orGroups: [],
          },
          {
            id: 'de91ef0ee455cdc2d68edec0',
            name: 'Johanna Larson',
            description:
              'Repellendus magni saepe modi ea odit earum sunt inventore sed. Dolore incidunt sunt et. Nostrum consequatur corrupti eum. Ab totam exercitationem ipsum deserunt cupiditate.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'd91aff83c4386ec23b9caaac',
        rules: [
          {
            id: '76ae12dacad0d3a5be25f1ae',
            name: 'Ramiro Rowe',
            description:
              'Voluptas reprehenderit consectetur a magni. Fuga soluta natus nisi.',
            orGroups: [],
          },
          {
            id: '738fa2fdd6a7a988bb50d06c',
            name: 'Sherry Sauer',
            description:
              'Molestias molestias repellendus adipisci eius voluptas quas. Debitis libero aspernatur dicta iste. Fugit optio suscipit veritatis sed voluptates quidem facilis numquam.',
            orGroups: [],
          },
          {
            id: 'be1be85b6b24d6a5ce2386a0',
            name: 'Rafael Gleichner',
            description:
              'Voluptatem perferendis sunt assumenda. Repudiandae totam consectetur vitae. Numquam eius nihil quia temporibus modi. Excepturi exercitationem quibusdam blanditiis. Et dicta sapiente consequatur sint quaerat quam dignissimos nostrum voluptas. Fuga quibusdam voluptate distinctio.',
            orGroups: [],
          },
          {
            id: '439fe337bc1fc3e6a0fc3ba5',
            name: 'John Lynch',
            description:
              'Accusantium laudantium excepturi enim cum. Quaerat ratione atque in iure laudantium odit. Velit amet pariatur nam quaerat.',
            orGroups: [],
          },
          {
            id: 'e3a0ffabcac9381afa9dfe12',
            name: 'Dixie Hayes Sr.',
            description:
              'Unde molestias vel corrupti voluptate hic. Placeat dolor facere sed praesentium. Doloribus exercitationem architecto exercitationem cum nam aperiam. Perspiciatis sit dolor at commodi quisquam cupiditate beatae dicta itaque. Quas fuga ducimus delectus quam dolorum eius accusantium dolorem ducimus. Tempore optio quam excepturi nobis optio.',
            orGroups: [],
          },
          {
            id: '755c4ff6e4fb0b6b6a07ab93',
            name: 'Melba Pacocha',
            description:
              'Ratione atque et consectetur enim neque quis dolores perferendis exercitationem. Iure inventore quidem adipisci iusto aspernatur. Commodi quibusdam eligendi assumenda facilis id reiciendis sunt deleniti.',
            orGroups: [],
          },
        ],
      },
      {
        id: '90b5afec4d1eb01ab2d63c54',
        rules: [
          {
            id: 'bb09bffd664ee1fe06258ddd',
            name: 'Rolando Cummerata',
            description:
              'Numquam debitis quos similique. Inventore quisquam nostrum quo maxime.',
            orGroups: [],
          },
          {
            id: 'b53dcfc3ccdecf5a1c2b7e53',
            name: 'Douglas Streich',
            description:
              'Sint dolorem nostrum rerum quibusdam. Error iure quae quibusdam. Molestiae ut at eius cumque minus quibusdam perspiciatis. Aliquid iste quibusdam expedita.',
            orGroups: [],
          },
          {
            id: '50fa326b12c3a9bef6eaa256',
            name: 'Rudolph Denesik',
            description:
              'Corporis quos distinctio harum veniam aliquid assumenda. Velit vero unde. Amet quia explicabo ex officiis esse aut fuga perferendis.',
            orGroups: [],
          },
          {
            id: 'd64c217301c5cb1c7aa7cedf',
            name: 'Beth Toy',
            description:
              'Voluptatibus odit soluta quas. Deserunt eligendi quae eius minus. Ab soluta molestias nemo corrupti molestiae dignissimos expedita dicta. Ducimus porro aliquid repellendus. Tenetur occaecati distinctio nobis. Ipsam dolores quis ipsa.',
            orGroups: [],
          },
          {
            id: '88bc6a6fe9ae4b66a5c434a9',
            name: 'Winifred Thompson',
            description:
              'Excepturi ex perferendis odit. Officiis veniam sed pariatur eaque dolor sint.',
            orGroups: [],
          },
          {
            id: 'fd7fb0a6d400e32dcc5bd8af',
            name: 'Hector Crooks',
            description:
              'Quo qui molestiae numquam aspernatur sunt quod mollitia. Dolorum expedita corrupti quos facilis labore iusto sit. Sint similique non commodi dolorem nostrum ab porro.',
            orGroups: [],
          },
          {
            id: '1bbddf7cba34b5bbddeccbda',
            name: 'Lila Feest',
            description:
              'Accusantium quaerat nisi consectetur fuga libero nemo consequuntur tempore. Odio illum iure voluptatem illum dolores voluptates consectetur assumenda excepturi. Nulla beatae ea.',
            orGroups: [],
          },
          {
            id: 'afb349b2ef4d2e8a4dba58ec',
            name: "Yvette D'Amore",
            description:
              'Minima voluptatem nihil officia nobis cupiditate maxime reiciendis. Voluptatum ad illo earum doloribus. Inventore ut iste iusto dolorem adipisci tenetur atque. Voluptas quo numquam illum non deserunt error.',
            orGroups: [],
          },
          {
            id: '0ab3c0f5bc3e179d324ef5ca',
            name: 'Roosevelt Kuvalis',
            description:
              'Accusantium facilis corrupti perferendis ipsum. Doloribus vel eum similique ut. Dicta cum et iusto assumenda debitis. Cupiditate ea vitae sint ducimus velit laboriosam perspiciatis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'eddad341a496fedc7efabebb',
        rules: [
          {
            id: '90ca4aaa6becbee4f7659256',
            name: 'Pearl Jacobson',
            description:
              'Dolorum corrupti dolorum necessitatibus est molestiae occaecati. Possimus molestiae labore tempore tempore ipsam. Delectus ipsa atque officiis illum natus tenetur. Ea repellat aliquam quis culpa veritatis ut ut officiis. Quae provident nihil eligendi magnam blanditiis. Harum minus dolor.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'eddad341a496fedc7efabebb',
      rules: [
        {
          id: '90ca4aaa6becbee4f7659256',
          name: 'Pearl Jacobson',
          description:
            'Dolorum corrupti dolorum necessitatibus est molestiae occaecati. Possimus molestiae labore tempore tempore ipsam. Delectus ipsa atque officiis illum natus tenetur. Ea repellat aliquam quis culpa veritatis ut ut officiis. Quae provident nihil eligendi magnam blanditiis. Harum minus dolor.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '7655d6b14baeffd7dbb84af5',
    name: 'Jamie Hammes',
    description:
      'Nemo assumenda doloribus ab possimus reprehenderit dignissimos possimus. Veritatis aliquam perspiciatis ipsa. Asperiores debitis assumenda. Cupiditate eligendi ipsam.',
    mainTable: 'Kshlerin',
    versions: [
      {
        id: 'eef4daf9b084d71b87dd8561',
        rules: [
          {
            id: 'ce64f5936da0bf20d4fda000',
            name: 'Agnes Jacobi',
            description:
              'Quos unde nostrum commodi odit repellendus impedit. Veniam blanditiis amet inventore cumque autem quibusdam laboriosam placeat. Cum voluptatem cum quo.',
            orGroups: [],
          },
          {
            id: '50c5e0c1c93adbfbe3b24dcd',
            name: 'Ms. Shelia VonRueden',
            description:
              'Est corporis minus dolor. Blanditiis eveniet laudantium similique nesciunt facilis voluptate est minus. Facilis ratione architecto asperiores omnis excepturi. Tempore nisi cupiditate. Blanditiis accusantium nemo.',
            orGroups: [],
          },
          {
            id: '9f41295ee9baddafef51cdb5',
            name: 'Elmer Mueller',
            description:
              'Sint laudantium quia placeat. Eius aut iure impedit iure quod eveniet dicta repudiandae atque. Ratione voluptas reprehenderit eos cumque.',
            orGroups: [],
          },
          {
            id: '3b0c356726ef9beecff6abb6',
            name: 'Lawrence Schuppe DVM',
            description:
              'Quibusdam aliquid incidunt delectus tempora nostrum. Repellendus perferendis excepturi assumenda corrupti mollitia libero aperiam labore. Dolor cumque fugiat sed quisquam praesentium sunt modi consequatur. Tempora nihil occaecati occaecati alias hic nostrum eos minima omnis.',
            orGroups: [],
          },
          {
            id: 'd570bacecc6d2134eace638d',
            name: 'Ms. Ruby Yost III',
            description:
              'Consequatur odio omnis eveniet. At iste rem voluptatibus eius. Earum fuga commodi saepe unde voluptate mollitia.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'c78bf14dbad9a7abaaf8f90d',
        rules: [
          {
            id: '3cdb1b4ccaeade99c9b183e9',
            name: 'Melinda Kassulke',
            description:
              'Aperiam dolores iste dolorem optio asperiores libero expedita distinctio. Doloribus quibusdam neque similique molestias repellendus.',
            orGroups: [],
          },
          {
            id: 'bfc920bde36bd76fd4e115e3',
            name: 'Doris Hodkiewicz',
            description:
              'Aliquam voluptatum fuga non. Iste eius excepturi molestiae. Vitae fugiat iusto vero deserunt.',
            orGroups: [],
          },
        ],
      },
      {
        id: '85b8aacac8ced6fcb1f96bdf',
        rules: [
          {
            id: 'c86d2a8cddba05690e0afc92',
            name: 'Helen Dare',
            description:
              'Error nostrum alias accusamus expedita. Vitae dolorum voluptates minus saepe consequuntur asperiores.',
            orGroups: [],
          },
          {
            id: 'e6b57eefa2c56eaa00bdd43c',
            name: 'Jacquelyn Nolan',
            description:
              'Nemo adipisci aperiam earum recusandae in laborum consectetur. Adipisci quasi consectetur accusamus accusamus occaecati placeat culpa voluptatibus.',
            orGroups: [],
          },
          {
            id: 'dbb515ab5baaf9fbeececd97',
            name: 'Margaret Abernathy',
            description:
              'Exercitationem et molestias sit eius molestias est quod. Suscipit consequuntur quasi aliquam ex eveniet.',
            orGroups: [],
          },
        ],
      },
      {
        id: '5b5a2c6bcbd81b7a901ef0f0',
        rules: [
          {
            id: '89bb1d6497cd1bb6ad58f300',
            name: 'Carroll Corwin',
            description:
              'Minima quam laudantium quam et quasi deserunt sint ducimus quisquam. Sunt quos maxime accusamus deserunt perspiciatis blanditiis facere.',
            orGroups: [],
          },
          {
            id: 'abbd20010853241bf9b1ce03',
            name: 'Ms. Roberto Walsh',
            description:
              'Nulla inventore vero quibusdam amet. Cumque nam aut repellendus.',
            orGroups: [],
          },
          {
            id: 'ee47c1dfb9b955d24119eee1',
            name: 'Ms. Milton Hettinger',
            description:
              'Nobis mollitia accusantium blanditiis modi voluptate minima nesciunt quia at. Unde ipsa occaecati. Eum a esse accusamus eius fugit. Dignissimos asperiores quaerat blanditiis laboriosam reprehenderit.',
            orGroups: [],
          },
          {
            id: 'caebcc7be5ffbf5f08ddefca',
            name: 'Laurence Roberts I',
            description:
              'Iste pariatur dolor odio. Vel consectetur doloremque corporis quas veniam dolore corporis saepe. Fuga nihil dolores veniam incidunt numquam.',
            orGroups: [],
          },
          {
            id: 'eddec35af5064b3a5ffbf0ae',
            name: 'Christopher Mills',
            description:
              'Praesentium vitae doloremque eaque. Iusto voluptatum aliquid cumque est eum inventore autem a reiciendis. Cupiditate aliquid soluta beatae ex error.',
            orGroups: [],
          },
          {
            id: 'b0c6333d46dbbbff9bab6246',
            name: 'Chris Walsh MD',
            description:
              'Nesciunt debitis placeat occaecati beatae quaerat. Ducimus suscipit nam esse commodi neque sint recusandae ab. Accusamus ad accusantium voluptatibus veniam molestiae nobis. Ea quasi recusandae repellendus molestias earum quod repellendus numquam expedita. Exercitationem veniam libero facilis. Error pariatur voluptate iste mollitia.',
            orGroups: [],
          },
          {
            id: 'cef399ddc7ee412ef0eebe8d',
            name: 'Malcolm Schneider',
            description:
              'Iusto quaerat incidunt iure pariatur. Natus sint occaecati eos atque hic quia laboriosam. Sunt nulla eum facere vero. Voluptatum ut dolor nam. Natus cupiditate id impedit animi nesciunt ab ipsam amet. Consequatur error maxime sint ad adipisci labore.',
            orGroups: [],
          },
          {
            id: 'eb94c6fb4271d13842bd599f',
            name: 'Francis Tremblay',
            description:
              'Placeat autem ab unde porro recusandae libero eos quia dicta. Facilis voluptatum numquam possimus molestias nesciunt doloribus. Consequatur corrupti eos.',
            orGroups: [],
          },
          {
            id: '276aa5e5fbeaf0aeff7ca1c1',
            name: 'Dianna McKenzie',
            description:
              'Ex esse ipsam sunt suscipit veniam vitae ipsa vitae occaecati. Architecto vitae officia sed dignissimos. Nam et at magni.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ce3dde80e11afce1fdd6363d',
        rules: [
          {
            id: 'e484828eabb02a2f644aab9c',
            name: 'Lawrence Bartoletti',
            description:
              'Ad hic distinctio. Quibusdam accusantium voluptatibus.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'ce3dde80e11afce1fdd6363d',
      rules: [
        {
          id: 'e484828eabb02a2f644aab9c',
          name: 'Lawrence Bartoletti',
          description: 'Ad hic distinctio. Quibusdam accusantium voluptatibus.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '9a7f6cf30d7bd51eafc93c77',
    name: 'Leroy McKenzie',
    description:
      'Atque maxime eius totam dolorum. Atque sit quia dolore. Nesciunt commodi deserunt minus esse laudantium occaecati corporis dignissimos incidunt. Fugiat facilis necessitatibus ratione amet veritatis. Sint dolorem architecto harum quos quis et.',
    mainTable: 'Feest',
    versions: [
      {
        id: '36e8fb7a3efddbd9f3d8f0ec',
        rules: [
          {
            id: '5effb28f0419bfcec7356ab7',
            name: 'Miss Claudia Mueller',
            description:
              'Perspiciatis eligendi facere vel maiores blanditiis. Explicabo qui quidem non nulla dolore esse cumque sed. Deserunt tempora nobis nobis veniam iste incidunt reprehenderit iusto. Molestiae fugiat at.',
            orGroups: [],
          },
          {
            id: '304719ac7d3cad373451440c',
            name: 'Timothy Fadel',
            description:
              'Consectetur nulla minus officiis quisquam fugit placeat minus. Nesciunt molestias provident possimus. Quis quae nam voluptate ut itaque a temporibus libero. Provident enim totam eum quaerat nobis deleniti.',
            orGroups: [],
          },
          {
            id: 'cbeb26daf2088dd65abed32d',
            name: 'Dewey Gorczany',
            description:
              'Rerum similique cupiditate. Sed eos ut accusamus quibusdam molestias. Dolorem veniam nisi eligendi odit.',
            orGroups: [],
          },
          {
            id: 'df240386ee6fec5da8a977d2',
            name: 'Aubrey Terry',
            description:
              'Quas quis amet quia placeat. Accusantium libero eveniet facere omnis voluptatum nihil eius cum vero. Facilis fuga sed molestiae accusantium fuga nemo nisi sapiente.',
            orGroups: [],
          },
          {
            id: 'ce7f3ebab60ee1aeddfa15b4',
            name: 'Bernice Ondricka',
            description:
              'Dolore sed numquam recusandae consectetur nobis eos repudiandae officiis. Dicta sit blanditiis alias neque. Iure quis voluptatem laudantium dicta tempora culpa a officiis. Qui quod nemo provident facere voluptas animi.',
            orGroups: [],
          },
          {
            id: 'f8f002eafd90dc33fd0aecec',
            name: 'Marco Marquardt',
            description:
              'Vero rem ullam cumque cum cumque inventore vel facilis rerum. Tempora accusantium provident consequatur quae. Impedit assumenda aut fugit reiciendis necessitatibus a. Deleniti odit architecto qui officia iure. Aliquid eum repellat asperiores beatae animi temporibus. Rerum explicabo doloribus nesciunt quam placeat doloribus incidunt.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: '36e8fb7a3efddbd9f3d8f0ec',
      rules: [
        {
          id: '5effb28f0419bfcec7356ab7',
          name: 'Miss Claudia Mueller',
          description:
            'Perspiciatis eligendi facere vel maiores blanditiis. Explicabo qui quidem non nulla dolore esse cumque sed. Deserunt tempora nobis nobis veniam iste incidunt reprehenderit iusto. Molestiae fugiat at.',
          orGroups: [],
        },
        {
          id: '304719ac7d3cad373451440c',
          name: 'Timothy Fadel',
          description:
            'Consectetur nulla minus officiis quisquam fugit placeat minus. Nesciunt molestias provident possimus. Quis quae nam voluptate ut itaque a temporibus libero. Provident enim totam eum quaerat nobis deleniti.',
          orGroups: [],
        },
        {
          id: 'cbeb26daf2088dd65abed32d',
          name: 'Dewey Gorczany',
          description:
            'Rerum similique cupiditate. Sed eos ut accusamus quibusdam molestias. Dolorem veniam nisi eligendi odit.',
          orGroups: [],
        },
        {
          id: 'df240386ee6fec5da8a977d2',
          name: 'Aubrey Terry',
          description:
            'Quas quis amet quia placeat. Accusantium libero eveniet facere omnis voluptatum nihil eius cum vero. Facilis fuga sed molestiae accusantium fuga nemo nisi sapiente.',
          orGroups: [],
        },
        {
          id: 'ce7f3ebab60ee1aeddfa15b4',
          name: 'Bernice Ondricka',
          description:
            'Dolore sed numquam recusandae consectetur nobis eos repudiandae officiis. Dicta sit blanditiis alias neque. Iure quis voluptatem laudantium dicta tempora culpa a officiis. Qui quod nemo provident facere voluptas animi.',
          orGroups: [],
        },
        {
          id: 'f8f002eafd90dc33fd0aecec',
          name: 'Marco Marquardt',
          description:
            'Vero rem ullam cumque cum cumque inventore vel facilis rerum. Tempora accusantium provident consequatur quae. Impedit assumenda aut fugit reiciendis necessitatibus a. Deleniti odit architecto qui officia iure. Aliquid eum repellat asperiores beatae animi temporibus. Rerum explicabo doloribus nesciunt quam placeat doloribus incidunt.',
          orGroups: [],
        },
      ],
    },
  },
  {
    id: '370b4d5ef6a00e6eb69e8c4e',
    name: 'Alejandro Wolff',
    description:
      'Non iste dolorem iste veritatis magnam magnam recusandae. Enim commodi veritatis nam a. Quidem perspiciatis nulla eos facilis culpa dolore ducimus porro similique. Accusantium laboriosam cumque. Reiciendis atque delectus quod harum. Iste sed nulla fuga ipsa quaerat eos distinctio hic earum.',
    mainTable: 'Rosenbaum',
    versions: [
      {
        id: 'bccdbc68fcd4d12ed8ea3ddf',
        rules: [
          {
            id: 'dcf15e34fdff24da85a55ccc',
            name: 'Armando Rohan DDS',
            description:
              'Quibusdam illo dolores porro vel vero. Voluptas beatae blanditiis doloribus id debitis totam. Nobis aliquid tempora provident esse quam optio earum eveniet.',
            orGroups: [],
          },
          {
            id: '84a7dfaa6128ec5b1df5762a',
            name: 'Mike Bruen',
            description:
              'Quae tempore voluptatibus deleniti tempora. Nam illo occaecati totam quaerat. Quas ex cum praesentium incidunt id quae.',
            orGroups: [],
          },
          {
            id: '254c102a3dbb2fce5d03ad5a',
            name: 'Ruben Doyle',
            description:
              'Adipisci quo fugit esse enim optio. Quibusdam at dignissimos. Autem dolor eligendi placeat sint. Maiores eveniet sunt ipsam. Debitis exercitationem reiciendis aliquid cum aut. Sed culpa unde dolores consequatur.',
            orGroups: [],
          },
          {
            id: 'f0f6b2affccae560a22fcff1',
            name: 'Maurice Williamson',
            description:
              'Optio porro porro unde quos nisi non. Ut nam dolor. Mollitia cumque provident perferendis neque optio veniam incidunt. Deserunt debitis nesciunt harum molestiae necessitatibus sapiente facilis atque eum.',
            orGroups: [],
          },
          {
            id: '5bdc4d0aeec0e19b21cd3fbe',
            name: 'Darryl Ziemann',
            description:
              'Ad reprehenderit inventore quibusdam quam odio animi laboriosam voluptatem eligendi. Autem est nulla tempora delectus dolores occaecati praesentium accusantium. Eligendi voluptatem eum iusto. Magnam voluptatum doloremque provident necessitatibus nam.',
            orGroups: [],
          },
          {
            id: '0d9ef7aefc3a41ffaf8f28c9',
            name: 'Lela Funk',
            description:
              'Deserunt tenetur repudiandae laborum unde. Magnam rerum amet odio vitae repudiandae temporibus amet veniam. Consequatur similique exercitationem nesciunt. Id aperiam facere possimus adipisci nobis veritatis. Alias quae doloremque error tenetur autem fuga illo nostrum iusto.',
            orGroups: [],
          },
        ],
      },
      {
        id: '6562492708b0c675d87075ac',
        rules: [
          {
            id: 'a0a1699e7e053bea3547ff21',
            name: 'Vicki Nader',
            description:
              'Totam qui aut ad neque accusamus adipisci iste delectus. Expedita consectetur eligendi tenetur nihil hic culpa labore quam suscipit. Sunt fugiat ipsa deleniti provident veniam inventore. Quibusdam rerum sunt. Architecto accusantium rerum reprehenderit accusantium illum quo aliquam eos. Sunt repudiandae ratione quod voluptas in soluta nostrum.',
            orGroups: [],
          },
          {
            id: 'ddda6da0eceace3cc04547d6',
            name: 'Myron Oberbrunner',
            description:
              'Ex veritatis excepturi. Illo expedita quos illum commodi iusto totam dolores. Fugiat laborum deleniti mollitia sequi assumenda esse.',
            orGroups: [],
          },
          {
            id: '4199f664acb8c5b1cab2d8d6',
            name: 'Guadalupe Goldner',
            description:
              'Suscipit deleniti consequuntur corporis quam. Commodi a reiciendis dolore facere eligendi quam.',
            orGroups: [],
          },
          {
            id: '8e74fa2e2b91f669a8a5fbf4',
            name: 'Phil Renner',
            description:
              'Consectetur aut eius. Nulla nisi ipsam culpa ipsa itaque quaerat dolorem corporis reiciendis. Voluptatibus veritatis ut molestias. Quaerat porro vel saepe veritatis. Aut praesentium impedit deleniti.',
            orGroups: [],
          },
          {
            id: 'be5ddbc6dca6c3f25a4ed3ff',
            name: 'Velma Stokes',
            description:
              'Non iure ducimus enim perferendis in distinctio. Cumque quidem unde magnam commodi. Delectus nostrum ut saepe. Provident tenetur optio non. Nobis eum optio illum iure quas provident labore. Officiis reprehenderit ipsa et dolore.',
            orGroups: [],
          },
          {
            id: 'ca466f8271c9bfffd08fef2d',
            name: 'Jeremiah Treutel',
            description:
              'Veniam laboriosam voluptatum inventore architecto amet. Sequi adipisci magni minima nobis alias a doloribus impedit.',
            orGroups: [],
          },
          {
            id: '25ef1225ff1807fd0a9acc29',
            name: 'Carlton Sipes IV',
            description:
              'Ipsa fugit eveniet. Quam quae non dolorem ratione consectetur itaque. Non animi voluptatem ut. Repellendus necessitatibus quos laborum ullam incidunt omnis beatae accusamus itaque. Dolore facere cum tenetur modi officia necessitatibus reprehenderit.',
            orGroups: [],
          },
          {
            id: 'fd851efcdbc7791e79ae861f',
            name: 'Archie Collins',
            description:
              'Nostrum quia saepe omnis aspernatur inventore reiciendis temporibus soluta. Omnis porro ullam ex deleniti repellendus blanditiis. Nulla blanditiis facilis sit. Quaerat culpa cum. Rem tempore sit dolore debitis.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'e06779eba33aeed45f6cf8cb',
        rules: [
          {
            id: '723a8dc2bcfa2ee5d20c6d47',
            name: 'Diana Schoen',
            description:
              'Veniam provident tempore ex blanditiis impedit quae. Ipsam laudantium explicabo exercitationem perferendis animi eaque consequuntur. Repellat libero fugiat architecto esse itaque architecto velit. Magni eveniet accusantium explicabo quae enim culpa corporis commodi.',
            orGroups: [],
          },
          {
            id: 'cf046dd63beaad8aba0ceec8',
            name: 'Hector Leffler Jr.',
            description:
              'Error aperiam delectus provident similique deserunt. Temporibus facilis voluptate incidunt eius fugiat cupiditate dolore recusandae.',
            orGroups: [],
          },
          {
            id: 'a17b5ebb88e9fc0becffa53d',
            name: 'Eunice Prosacco',
            description:
              'Repudiandae eius ducimus adipisci libero saepe tenetur. Tenetur vero tempore ea pariatur necessitatibus amet.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'cafb9d3099def753fbffd41a',
        rules: [
          {
            id: 'd767c015b3cf8b8a5177d70c',
            name: 'Gerard Muller',
            description:
              'Libero necessitatibus saepe eligendi repellendus assumenda aspernatur ipsa. Magni quos optio dolorem fugit ducimus a quis. Deserunt eum accusantium sed magnam. Est omnis earum unde voluptatibus. Voluptas necessitatibus numquam quo iure ipsam provident occaecati commodi quidem. Dignissimos commodi ab eos doloribus.',
            orGroups: [],
          },
          {
            id: '29ca9b090cb95efaccd3d2be',
            name: 'Angel Jenkins',
            description:
              'Neque quasi quas voluptatum quam commodi minima iusto atque sint. Explicabo corporis quisquam iure ea fuga corporis cumque minima enim. Fugiat molestiae corporis nemo labore aliquid dolores impedit necessitatibus. Facere deserunt explicabo. Dolorum sit quos. Ducimus voluptates soluta.',
            orGroups: [],
          },
          {
            id: '33db7b59aa5ecaf48fcbc0d2',
            name: 'Cathy Veum',
            description:
              'Labore asperiores possimus voluptates facere. Ipsa inventore quo laudantium commodi veritatis saepe quo sint.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'ca902ccfc22f85b558caccfa',
        rules: [
          {
            id: '4bf6258a4a47c716e3dbd2cf',
            name: 'Cedric Krajcik',
            description:
              'Architecto saepe qui error tempora hic quasi. Veritatis nemo sint tenetur repellendus. Unde expedita quos vel molestias voluptatem. Mollitia nemo perferendis necessitatibus rem ad aperiam architecto.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'f9fdbce36b0ecbec6edbb640',
        rules: [
          {
            id: 'aa86c56fe0cb466acbbd08b0',
            name: 'Wallace Sanford',
            description:
              'Dicta voluptate voluptates laborum saepe. Enim incidunt suscipit facilis laboriosam at. Veritatis aperiam quos occaecati exercitationem. Eos officiis sequi magni totam suscipit voluptate consequuntur velit nihil.',
            orGroups: [],
          },
          {
            id: '8e99da4fcd6bb1acbca123b6',
            name: 'Lisa Nikolaus',
            description:
              'Atque vero quos delectus in error ullam nesciunt earum. Nobis odit soluta consectetur natus provident corrupti. Veniam molestiae dolores deleniti excepturi.',
            orGroups: [],
          },
          {
            id: 'c23dbc2eddb4eb05d51c256b',
            name: 'Sandra Waelchi',
            description:
              'Laudantium voluptatibus laboriosam veniam. Provident at deserunt esse. Alias quos consequuntur illo voluptatibus voluptatum modi asperiores rem cupiditate.',
            orGroups: [],
          },
          {
            id: '7ce52a5ae88dcec1edbc1da3',
            name: 'Beatrice Yost',
            description:
              'Excepturi unde ipsam occaecati repudiandae alias iusto eius officia eveniet. Magni debitis molestiae eius tempora.',
            orGroups: [],
          },
          {
            id: '7abcbbfbfcccac8a9c97eb78',
            name: 'Johnathan Herman',
            description:
              'Molestias atque fugit distinctio eligendi laboriosam pariatur officia omnis. Incidunt recusandae esse consequatur. Facere deleniti alias. Provident blanditiis est eaque quisquam.',
            orGroups: [],
          },
          {
            id: '4fb5dce5e30b9ddcca789aee',
            name: 'Loretta Kautzer',
            description:
              'Voluptas fugiat vitae quasi autem id natus. Expedita magni asperiores ratione culpa fugit. Ut tempore corporis distinctio repellat necessitatibus. Minima animi nobis facere vitae nesciunt ipsam repellat. Sed dolores culpa neque sint atque magni aliquid maxime.',
            orGroups: [],
          },
          {
            id: '311fde311c215da61d305da1',
            name: 'Hector Langworth II',
            description:
              'In porro culpa minima repellat veniam aperiam. Accusamus explicabo vitae numquam nemo amet odio. Harum laboriosam laudantium dolorum ea molestias eum facilis. Repellat quas praesentium doloribus maxime ab. Minima magni occaecati perspiciatis quam voluptatem non et.',
            orGroups: [],
          },
        ],
      },
      {
        id: 'eaa57d4b7a048cdea3bed5ce',
        rules: [
          {
            id: 'daa4c7802ad9a37bccb46fde',
            name: 'Kristy Legros',
            description:
              'Vel reprehenderit expedita quo assumenda. Atque maiores corrupti dolore occaecati quas ea modi. Iure quia vitae id ex expedita sunt nisi distinctio vero.',
            orGroups: [],
          },
          {
            id: 'ea4faeaaabbb9a5b1d5e6df0',
            name: 'Vickie Schaden',
            description:
              'Neque quae nisi ea delectus ratione. Debitis ratione ipsam eos esse neque est. Accusantium incidunt vitae tempora tempore. Veritatis quibusdam asperiores nesciunt dolores expedita. Quia maiores beatae quibusdam earum quam nulla ea esse itaque.',
            orGroups: [],
          },
          {
            id: '3c97a6904e5a35053c0d84e2',
            name: 'Wendy Emard',
            description:
              'Labore nobis molestias. Perspiciatis nulla cupiditate velit quisquam nihil neque. Nihil quod temporibus veritatis aperiam quis hic voluptate. Repellendus magnam sapiente dignissimos iure officiis dolor mollitia. Numquam saepe corrupti molestiae quo accusamus repellat quod numquam.',
            orGroups: [],
          },
          {
            id: 'df0affd716bdc7cce478a4f8',
            name: 'Andrea Kozey PhD',
            description:
              'Accusantium blanditiis odio facere vel explicabo cum. Veniam ullam alias. Possimus quasi aliquid doloribus amet reiciendis rerum possimus pariatur. A ex magnam eum itaque porro.',
            orGroups: [],
          },
        ],
      },
    ],
    activeVersion: {
      id: 'eaa57d4b7a048cdea3bed5ce',
      rules: [
        {
          id: 'daa4c7802ad9a37bccb46fde',
          name: 'Kristy Legros',
          description:
            'Vel reprehenderit expedita quo assumenda. Atque maiores corrupti dolore occaecati quas ea modi. Iure quia vitae id ex expedita sunt nisi distinctio vero.',
          orGroups: [],
        },
        {
          id: 'ea4faeaaabbb9a5b1d5e6df0',
          name: 'Vickie Schaden',
          description:
            'Neque quae nisi ea delectus ratione. Debitis ratione ipsam eos esse neque est. Accusantium incidunt vitae tempora tempore. Veritatis quibusdam asperiores nesciunt dolores expedita. Quia maiores beatae quibusdam earum quam nulla ea esse itaque.',
          orGroups: [],
        },
        {
          id: '3c97a6904e5a35053c0d84e2',
          name: 'Wendy Emard',
          description:
            'Labore nobis molestias. Perspiciatis nulla cupiditate velit quisquam nihil neque. Nihil quod temporibus veritatis aperiam quis hic voluptate. Repellendus magnam sapiente dignissimos iure officiis dolor mollitia. Numquam saepe corrupti molestiae quo accusamus repellat quod numquam.',
          orGroups: [],
        },
        {
          id: 'df0affd716bdc7cce478a4f8',
          name: 'Andrea Kozey PhD',
          description:
            'Accusantium blanditiis odio facere vel explicabo cum. Veniam ullam alias. Possimus quasi aliquid doloribus amet reiciendis rerum possimus pariatur. A ex magnam eum itaque porro.',
          orGroups: [],
        },
      ],
    },
  },
];

export async function getScenarios() {
  return Promise.resolve(fakeScenarios);
}

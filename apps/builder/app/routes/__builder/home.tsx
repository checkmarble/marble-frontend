import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: 'navigation',
};

export default function Scenarios() {
  const { t } = useTranslation('navigation');

  return (
    <div className="p-4">
      <h1>{t('analytics')}</h1>
      <p>
        Ipsa doloremque voluptate velit et sint dolores amet ullam. Incidunt ut
        consequatur. Vel ullam cupiditate repudiandae a voluptatem laboriosam
        et. Consequatur ab non. Ad culpa quos ea earum molestias assumenda
        veniam. Fuga totam dolores dicta qui velit ipsa unde. Est qui quia ut
        possimus est repudiandae. Delectus eos dolores veritatis doloremque odit
        deleniti quidem omnis explicabo. Vel quo sint aspernatur quia
        repellendus molestias. Odio qui sunt voluptatem est labore. Fugit
        consequatur tenetur. Optio quaerat laboriosam nesciunt. Id quia fugit ea
        dolores enim et. Eos et eveniet iste rem. Deserunt modi maiores.
        Doloribus ut libero.
      </p>
    </div>
  );
}

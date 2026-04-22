from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_add_slug_to_salon'),
    ]

    operations = [
        migrations.CreateModel(
            name='SalonOpeningHour',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day_of_week', models.IntegerField(choices=[(0, 'Lundi'), (1, 'Mardi'), (2, 'Mercredi'), (3, 'Jeudi'), (4, 'Vendredi'), (5, 'Samedi'), (6, 'Dimanche')])),
                ('open_time', models.TimeField()),
                ('close_time', models.TimeField()),
                ('is_closed', models.BooleanField(default=False)),
                ('salon', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='opening_hours_set', to='core.salon')),
            ],
            options={
                'unique_together': {('salon', 'day_of_week')},
                'ordering': ['salon', 'day_of_week'],
                'verbose_name': "Horaire d'ouverture (jour)",
                'verbose_name_plural': "Horaires d'ouverture (par jour)",
            },
        ),
    ]

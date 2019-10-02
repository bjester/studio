# -*- coding: utf-8 -*-
# Semi-automatically generated by Micah 1.11.20 on 2019-04-24 23:05
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, connection
from contentcuration.models import ContentNode
from django.db.models import TextField

class Migration(migrations.Migration):

    dependencies = [
        ('contentcuration', '0100_calculate_included_languages'),
    ]

    operations = [

        migrations.RunSQL(
            # converts the extra_fields column from text to jsonb
            "ALTER TABLE %s ALTER COLUMN extra_fields TYPE jsonb USING extra_fields::json;" % ContentNode._meta.db_table,
            # keeps the Django model in sync with the database
            state_operations=[
                migrations.AlterField(
                    'contentnode',
                    'extra_fields',
                    django.contrib.postgres.fields.jsonb.JSONField(),
                ),
            ],
            # converts the extra_fields column from jsonb to text
            # (...not as critical, but needed to make the migration reversable for the test!)
            reverse_sql="ALTER TABLE %s ALTER COLUMN extra_fields TYPE text USING extra_fields #>> '{}';" % ContentNode._meta.db_table,
        ),

        # This is to update `ContentNode` entries with `extra_fields=="null"` to actual NULL values
        migrations.RunSQL(
            "UPDATE %s SET extra_fields=NULL WHERE extra_fields = 'null'" % ContentNode._meta.db_table,
            migrations.RunSQL.noop # don't bother to reverse this
        )
    ]

